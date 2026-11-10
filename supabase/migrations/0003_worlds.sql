-- ============================================================================
-- Gift of Words — Stage 4c: the worlds' data lives
-- ----------------------------------------------------------------------------
-- Apply after 0001_identity.sql and 0002_security.sql, in order.
--
-- 0001 creates the three identities — GOW-USER, GOW-DEB, GOW-EXT — in one
-- transaction. This file does two things on top of that:
--
--   1. GUARANTEES the pair. Every account owns exactly one debate identity and
--      one extempore identity, including accounts that predate the trigger, and
--      including any account created outside the normal sign-up path. There is a
--      repair function, a backfill over existing rows, and the sign-up trigger is
--      rewritten to use the same function — one code path, not two.
--
--   2. GIVES THEM SOMEWHERE TO WRITE. A session spine per world, and an event
--      table for everything analytics-shaped. The *contents* of a round — the
--      prompt, the rubric, the scores — are deliberately NOT decided here. They
--      arrive as real columns once the arena's rubric is fixed, by migration, not
--      by hoping the payload stays flexible forever.
--
-- Everything is idempotent. Re-running is safe.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. repair / guarantee: both world identities exist for an account
-- ---------------------------------------------------------------------------
create or replace function public.ensure_world_profiles(p_account uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt int := 0;
begin
  if not exists (select 1 from public.accounts where id = p_account) then
    raise exception 'ensure_world_profiles: no such account %', p_account
      using errcode = '23503';
  end if;

  -- Display IDs are random; a collision is vanishingly unlikely, but a signup
  -- must never fail over one, so we retry rather than raise.
  loop
    v_attempt := v_attempt + 1;
    begin
      insert into public.debate_profiles (account_id, display_id)
      values (p_account, public.gow_display_id('GOW-DEB'))
      on conflict (account_id) do nothing;

      insert into public.extempore_profiles (account_id, display_id)
      values (p_account, public.gow_display_id('GOW-EXT'))
      on conflict (account_id) do nothing;

      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise;
      end if;
    end;
  end loop;
end;
$$;

comment on function public.ensure_world_profiles(uuid) is
  'Creates whichever of the two world identities is missing. Idempotent.';

revoke execute on function public.ensure_world_profiles(uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. backfill: accounts that exist today without one of the pair
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select a.id
      from public.accounts a
     where not exists (select 1 from public.debate_profiles d    where d.account_id = a.id)
        or not exists (select 1 from public.extempore_profiles e where e.account_id = a.id)
  loop
    perform public.ensure_world_profiles(r.id);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. the sign-up trigger now uses that same function
-- ---------------------------------------------------------------------------
-- Behaviour is unchanged from 0001 except that profile creation is delegated,
-- so there is exactly one definition of "an account has both identities".
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

  loop
    v_attempt := v_attempt + 1;
    begin
      insert into public.accounts
        (auth_user_id, display_id, email, full_name, date_of_birth, country, status, notice_version)
      values
        (new.id, public.gow_display_id('GOW-USER'), new.email, v_full_name, v_dob, v_country, v_status, v_notice)
      returning id into v_account;

      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise;
      end if;
    end;
  end loop;

  -- Both world identities, always.
  perform public.ensure_world_profiles(v_account);

  if v_status = 'pending_guardian_consent' and v_guardian is not null then
    insert into public.guardian_consents (account_id, guardian_email, notice_version)
    values (v_account, v_guardian, v_notice)
    on conflict (account_id) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ============================================================================
-- 4. WHERE THE WORLDS WILL WRITE
-- ----------------------------------------------------------------------------
-- One spine per world. A session is a round someone actually practised: it
-- belongs to the account AND to that world's identity, so a query can never
-- accidentally mix the two ratings histories. `payload` carries whatever the
-- arena records until the rubric is fixed; when it is, those become real
-- columns and this stays as the raw capture.
-- ============================================================================

create table if not exists public.debate_sessions (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references public.accounts (id) on delete cascade,
  profile_id   uuid not null references public.debate_profiles (id) on delete cascade,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists public.extempore_sessions (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references public.accounts (id) on delete cascade,
  profile_id   uuid not null references public.extempore_profiles (id) on delete cascade,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists debate_sessions_account_idx
  on public.debate_sessions (account_id, started_at desc);
create index if not exists extempore_sessions_account_idx
  on public.extempore_sessions (account_id, started_at desc);

-- ---------------------------------------------------------------------------
-- 5. analytics
-- ---------------------------------------------------------------------------
-- One append-only stream, scoped to the account and, when it applies, to the
-- world identity that produced it. Written by the server (SECURITY DEFINER
-- functions or the service role), never by a client. Not readable by clients at
-- all: this is our data about the product, not their data about themselves.
create table if not exists public.analytics_events (
  id         bigint generated always as identity primary key,
  account_id uuid not null references public.accounts (id) on delete cascade,
  world      text not null check (world in ('account', 'debate', 'extempore')),
  profile_id uuid,
  name       text not null check (char_length(name) between 1 and 64),
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_account_idx
  on public.analytics_events (account_id, created_at desc);
create index if not exists analytics_events_world_idx
  on public.analytics_events (world, created_at desc);
create index if not exists analytics_events_name_idx
  on public.analytics_events (name, created_at desc);

-- ---------------------------------------------------------------------------
-- 6. row level security
-- ---------------------------------------------------------------------------
alter table public.debate_sessions    enable row level security;
alter table public.extempore_sessions enable row level security;
alter table public.analytics_events   enable row level security;

-- A student may read their own rounds, in that world only. No write policy:
-- rounds are opened and closed by server-side functions with their own rules.
drop policy if exists debate_sessions_select_own on public.debate_sessions;
create policy debate_sessions_select_own on public.debate_sessions
  for select to authenticated
  using (
    exists (
      select 1 from public.accounts a
       where a.id = account_id and a.auth_user_id = auth.uid()
    )
  );

drop policy if exists extempore_sessions_select_own on public.extempore_sessions;
create policy extempore_sessions_select_own on public.extempore_sessions
  for select to authenticated
  using (
    exists (
      select 1 from public.accounts a
       where a.id = account_id and a.auth_user_id = auth.uid()
    )
  );

-- analytics_events: RLS on, zero policies. Nobody but the owner role (and
-- therefore SECURITY DEFINER functions) and the service role can touch it.

revoke insert, update, delete on public.debate_sessions    from anon, authenticated;
revoke insert, update, delete on public.extempore_sessions from anon, authenticated;
revoke insert, update, delete on public.analytics_events   from anon, authenticated;
revoke select                  on public.analytics_events   from anon, authenticated;

-- ============================================================================
-- 7. verify
-- ============================================================================
-- a) every account has exactly two world identities, and none has zero:
--
--   select count(*) filter (where d.account_id is null) as missing_debate,
--          count(*) filter (where e.account_id is null) as missing_extempore
--     from public.accounts a
--     left join public.debate_profiles d    on d.account_id = a.id
--     left join public.extempore_profiles e on e.account_id = a.id;
--   -- both columns must be 0
--
-- b) the three identities for one person:
--
--   select a.display_id as account, d.display_id as debate, e.display_id as extempore
--     from public.accounts a
--     left join public.debate_profiles d    on d.account_id = a.id
--     left join public.extempore_profiles e on e.account_id = a.id;
--
-- c) the new tables are locked down:
--
--   select tablename, rowsecurity,
--          (select count(*) from pg_policies p
--            where p.schemaname='public' and p.tablename=t.tablename) as policies
--     from pg_tables t
--    where schemaname='public'
--      and tablename in ('debate_sessions','extempore_sessions','analytics_events');
--   -- all rowsecurity = true; sessions 1 policy each; analytics_events 0
--
-- d) a new sign-up still produces all three (do this through the app, not SQL):
--   select * from public.accounts order by created_at desc limit 1;
--   select * from public.debate_profiles order by created_at desc limit 1;
--   select * from public.extempore_profiles order by created_at desc limit 1;
