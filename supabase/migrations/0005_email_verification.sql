-- ============================================================================
-- Gift of Words — Stage 4e: six-digit email verification
-- ----------------------------------------------------------------------------
-- Apply after 0001 -> 0004.
--
-- Replaces the "click a link in your inbox" hop with a code the learner types.
-- The reasons it is better than a magic link, written down because they are
-- product decisions and not just implementation detail:
--
--   * no redirect URL configuration, so no blank page when an allowlist is
--     incomplete — the single most common magic-link failure;
--   * no deep link, so it behaves identically in Gmail's in-app browser, which
--     is where most phones open mail;
--   * a code can be typed from a device that is not the one being registered.
--
-- What it does NOT change: a mail sender is still required. Six digits are only
-- useful if they arrive. See lib/email/send.ts.
--
-- Security model, in one place because it is the point of the table:
--   * the code is NEVER stored in plain text — bcrypt hash only;
--   * one open code per account (partial unique index), so issuing a new one
--     invalidates the old;
--   * 10 minutes to live, 5 attempts, then the row is destroyed;
--   * consumed rows are deleted immediately, so there is no window where a used
--     code is still verifiable;
--   * 120-second resend cooldown, enforced in SQL — not in the UI, where it
--     would be advisory;
--   * clients have no direct access to the table at all.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. the fact we are recording
-- ---------------------------------------------------------------------------
alter table public.accounts
  add column if not exists email_verified_at timestamptz;

comment on column public.accounts.email_verified_at is
  'Set once, by verify_email_otp(). Null means the address has never been proven.';

-- ---------------------------------------------------------------------------
-- 2. the codes
-- ---------------------------------------------------------------------------
create table if not exists public.email_otps (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references public.accounts (id) on delete cascade,
  code_hash    text not null,
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  attempts     smallint not null default 0 check (attempts >= 0),
  last_sent_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- At most one live code per account. Issuing a second one replaces the first,
-- which is also how "resend" invalidates the previous digits.
create unique index if not exists email_otps_one_open_per_account
  on public.email_otps (account_id)
  where consumed_at is null;

create index if not exists email_otps_expiry_idx
  on public.email_otps (expires_at);

-- ---------------------------------------------------------------------------
-- 3. issue
-- ---------------------------------------------------------------------------
-- Returns the plain text code to the *server* so it can be emailed. It never
-- travels to the browser: the caller is a server action, not a client fetch.
--
-- A cooldown hit is not an error — it returns code = null and the seconds left,
-- which is exactly what the resend button needs to render.
create or replace function public.issue_email_otp()
returns table (code text, expires_at timestamptz, resend_after int)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_account   uuid;
  v_verified  timestamptz;
  v_open      public.email_otps%rowtype;
  v_code      text;
  v_wait      int;
  v_cooldown  constant int := 120;
begin
  if auth.uid() is null then
    raise exception 'issue_email_otp: not authenticated' using errcode = '28000';
  end if;

  select id, email_verified_at into v_account, v_verified
    from public.accounts
   where auth_user_id = auth.uid();

  if v_account is null then
    raise exception 'issue_email_otp: no account for this user' using errcode = '23503';
  end if;

  -- Already done: nothing to send, nothing to leak.
  if v_verified is not null then
    return query select null::text, null::timestamptz, 0;
    return;
  end if;

  select * into v_open
    from public.email_otps
   where account_id = v_account and consumed_at is null;

  if found then
    v_wait := v_cooldown - floor(extract(epoch from (now() - v_open.last_sent_at)))::int;
    if v_wait > 0 then
      return query select null::text, v_open.expires_at, v_wait;
      return;
    end if;
    -- Expired or superseded: retire it before issuing the next.
    delete from public.email_otps where id = v_open.id;
  end if;

  -- 000000-999999, leading zeros preserved.
  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');

  insert into public.email_otps (account_id, code_hash, expires_at, last_sent_at)
  values (v_account, crypt(v_code, gen_salt('bf', 8)), now() + interval '10 minutes', now());

  return query select v_code, now() + interval '10 minutes', v_cooldown;
end;
$$;

revoke execute on function public.issue_email_otp() from public, anon;
grant execute on function public.issue_email_otp() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. verify
-- ---------------------------------------------------------------------------
-- Returns a status rather than a boolean, because the UI has four different
-- things to say and "false" cannot distinguish them.
--
--   ok       verified; row destroyed, accounts.email_verified_at stamped
--   invalid  wrong digits, attempt counted
--   expired  past ten minutes; row destroyed
--   locked   five wrong attempts; row destroyed
--   none     no live code — ask for a new one
--   verified already verified
create or replace function public.verify_email_otp(p_code text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_account  uuid;
  v_verified timestamptz;
  v_row      public.email_otps%rowtype;
begin
  if auth.uid() is null then
    raise exception 'verify_email_otp: not authenticated' using errcode = '28000';
  end if;

  select id, email_verified_at into v_account, v_verified
    from public.accounts
   where auth_user_id = auth.uid();

  if v_account is null then
    raise exception 'verify_email_otp: no account for this user' using errcode = '23503';
  end if;

  if v_verified is not null then
    return 'verified';
  end if;

  -- Digits only: a malformed code is a wrong code, not a crash.
  if p_code is null or p_code !~ '^[0-9]{6}$' then
    return 'invalid';
  end if;

  select * into v_row
    from public.email_otps
   where account_id = v_account and consumed_at is null
   for update;

  if not found then
    return 'none';
  end if;

  if v_row.expires_at <= now() then
    delete from public.email_otps where id = v_row.id;
    return 'expired';
  end if;

  if v_row.attempts >= 5 then
    delete from public.email_otps where id = v_row.id;
    return 'locked';
  end if;

  if crypt(p_code, v_row.code_hash) = v_row.code_hash then
    update public.accounts
       set email_verified_at = now()
     where id = v_account;

    delete from public.email_otps where id = v_row.id;
    return 'ok';
  end if;

  update public.email_otps
     set attempts = attempts + 1
   where id = v_row.id
  returning * into v_row;

  if v_row.attempts >= 5 then
    delete from public.email_otps where id = v_row.id;
    return 'locked';
  end if;

  return 'invalid';
end;
$$;

revoke execute on function public.verify_email_otp(text) from public, anon;
grant execute on function public.verify_email_otp(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. read path for the server
-- ---------------------------------------------------------------------------
-- The signup action needs the address to send to; scoped to the caller so it
-- cannot be used to read someone else's.
create or replace function public.my_pending_verification()
returns table (account_id uuid, email text, full_name text, verified boolean, expires_at timestamptz, resend_after int)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_account uuid;
begin
  if auth.uid() is null then
    return;
  end if;

  select a.id into v_account
    from public.accounts a
   where a.auth_user_id = auth.uid();
  if v_account is null then
    return;
  end if;

  return query
    select a.id,
           a.email,
           a.full_name,
           a.email_verified_at is not null,
           o.expires_at,
           greatest(
             0,
             120 - coalesce(floor(extract(epoch from (now() - o.last_sent_at)))::int, 120)
           )
      from public.accounts a
      left join public.email_otps o
        on o.account_id = a.id and o.consumed_at is null
     where a.id = v_account;
end;
$$;

revoke execute on function public.my_pending_verification() from public, anon;
grant execute on function public.my_pending_verification() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. lock the table down
-- ---------------------------------------------------------------------------
alter table public.email_otps enable row level security;
-- No policies and no grants: the only way in is through the two functions above.
revoke all on public.email_otps from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. verify
-- ---------------------------------------------------------------------------
-- a) nobody can read the table:
--      select count(*) from public.email_otps;   -- as a logged-in user: 0 rows
--
-- b) a code round-trips (run while signed in, in the SQL editor with the anon
--    key this is awkward — use the app instead):
--      select * from public.issue_email_otp();    -- returns the code once
--      select public.verify_email_otp('123456');  -- 'ok' / 'invalid' / ...
--      select email_verified_at from public.accounts where auth_user_id = auth.uid();
--
-- c) the hash is not the code:
--      select code_hash from public.email_otps;   -- starts $2a$, never 6 digits
