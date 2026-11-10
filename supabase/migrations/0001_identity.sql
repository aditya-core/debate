-- ============================================================================
-- Gift of Words — Stage 4: identity
-- ----------------------------------------------------------------------------
-- One account (GOW-USER-XXXXX) with two permanent sub-identities:
--   • Debate     GOW-DEB-XXXXX
--   • Extempore  GOW-EXT-XXXXX
--
-- Design rules this file encodes:
--   1. Display IDs are identifiers, never credentials. The primary key is a UUID.
--   2. Both sub-profiles exist from the first second of the account's life.
--   3. The two worlds keep independent ratings. Nothing joins them at the
--      storage layer — only the analytics layer may read across both.
--   4. Clients can read their own rows and write nothing. Every write goes
--      through a SECURITY DEFINER function or the server.
--
-- Run this once, in the Supabase SQL editor, on a fresh project.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------

-- Crockford base32: no I, L, O or U — an ID that survives being read aloud.
create or replace function public.gow_display_id(p_prefix text)
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  body     text := '';
  total    int  := 0;
  idx      int;
  i        int;
begin
  for i in 1..7 loop
    idx   := floor(random() * 32)::int;
    body  := body || substr(alphabet, idx + 1, 1);
    total := total + idx;
  end loop;

  -- One checksum character catches transcription typos.
  return p_prefix || '-' || body || substr(alphabet, (total % 32) + 1, 1);
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- tables
-- ---------------------------------------------------------------------------

create table if not exists public.accounts (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid not null unique references auth.users (id) on delete cascade,
  display_id     text not null unique,
  email          text not null,
  full_name      text,
  date_of_birth  date,
  country        text,
  status         text not null default 'active'
                 check (status in ('active', 'pending_guardian_consent', 'suspended')),
  notice_version text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on column public.accounts.display_id is
  'Public identifier shown to the student. Never used for authorisation.';

create table if not exists public.debate_profiles (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  display_id text not null unique,
  rating     integer not null default 1000 check (rating >= 0),
  xp         integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.extempore_profiles (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  display_id text not null unique,
  rating     integer not null default 1000 check (rating >= 0),
  xp         integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Under-18 accounts need verifiable parental consent before practice unlocks.
create table if not exists public.guardian_consents (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references public.accounts (id) on delete cascade,
  guardian_email text not null,
  token_hash     text not null default md5(gen_random_uuid()::text || clock_timestamp()::text),
  notice_version text,
  requested_at   timestamptz not null default now(),
  consented_at   timestamptz,
  expires_at     timestamptz not null default now() + interval '14 days',
  unique (account_id)
);

create index if not exists accounts_auth_user_idx on public.accounts (auth_user_id);
create index if not exists guardian_consents_account_idx on public.guardian_consents (account_id);

drop trigger if exists accounts_touch on public.accounts;
create trigger accounts_touch before update on public.accounts
  for each row execute function public.touch_updated_at();

drop trigger if exists debate_touch on public.debate_profiles;
create trigger debate_touch before update on public.debate_profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists extempore_touch on public.extempore_profiles;
create trigger extempore_touch before update on public.extempore_profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- provisioning: one auth.users row → one account + two world profiles
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text  := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  v_dob       date  := nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date;
  v_guardian  text  := nullif(btrim(new.raw_user_meta_data ->> 'guardian_email'), '');
  v_notice    text  := nullif(new.raw_user_meta_data ->> 'notice_version', '');
  v_country   text  := nullif(new.raw_user_meta_data ->> 'country', '');
  v_age       int;
  v_status    text;
  v_account   uuid;
  v_attempt   int := 0;
begin
  if v_dob is not null then
    v_age := extract(year from age(current_date, v_dob))::int;
  end if;

  v_status := case
    when v_age is not null and v_age < 18 then 'pending_guardian_consent'
    else 'active'
  end;

  -- Display IDs are random; a collision is vanishingly unlikely but we retry
  -- rather than fail a signup over it.
  loop
    v_attempt := v_attempt + 1;
    begin
      insert into public.accounts
        (auth_user_id, display_id, email, full_name, date_of_birth, country, status, notice_version)
      values
        (new.id, public.gow_display_id('GOW-USER'), new.email, v_full_name, v_dob, v_country, v_status, v_notice)
      returning id into v_account;

      insert into public.debate_profiles (account_id, display_id)
      values (v_account, public.gow_display_id('GOW-DEB'));

      insert into public.extempore_profiles (account_id, display_id)
      values (v_account, public.gow_display_id('GOW-EXT'));

      if v_status = 'pending_guardian_consent' and v_guardian is not null then
        insert into public.guardian_consents (account_id, guardian_email, notice_version)
        values (v_account, v_guardian, v_notice);
      end if;

      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise;
      end if;
    end;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- row level security
-- Clients read their own rows. They cannot insert or update anything here:
-- provisioning happens in the trigger, and practice writes will go through
-- SECURITY DEFINER functions with their own validation.
-- ---------------------------------------------------------------------------

-- No write policy exists on purpose. An `update` policy keyed on
-- `auth_user_id = auth.uid()` would let a minor PATCH their own row and flip
-- `status` from 'pending_guardian_consent' to 'active', which would bypass
-- parental consent entirely. Profile changes will go through SECURITY DEFINER
-- functions that decide which columns a client may touch.

alter table public.accounts            enable row level security;
alter table public.debate_profiles     enable row level security;
alter table public.extempore_profiles  enable row level security;
alter table public.guardian_consents   enable row level security;

drop policy if exists accounts_select_own on public.accounts;
create policy accounts_select_own on public.accounts
  for select to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists debate_select_own on public.debate_profiles;
create policy debate_select_own on public.debate_profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.accounts a
      where a.id = account_id and a.auth_user_id = auth.uid()
    )
  );

drop policy if exists extempore_select_own on public.extempore_profiles;
create policy extempore_select_own on public.extempore_profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.accounts a
      where a.id = account_id and a.auth_user_id = auth.uid()
    )
  );

drop policy if exists consents_select_own on public.guardian_consents;
create policy consents_select_own on public.guardian_consents
  for select to authenticated
  using (
    exists (
      select 1 from public.accounts a
      where a.id = account_id and a.auth_user_id = auth.uid()
    )
  );

-- Belt and braces: RLS decides which *rows* an authenticated client may see;
-- these grants decide whether the role may write at all. With no write policy
-- and no write grant, a future policy added in haste still cannot mutate data.
revoke insert, update, delete on public.accounts           from anon, authenticated;
revoke insert, update, delete on public.debate_profiles    from anon, authenticated;
revoke insert, update, delete on public.extempore_profiles from anon, authenticated;
revoke insert, update, delete on public.guardian_consents  from anon, authenticated;
