-- ============================================================================
-- Gift of Words — Stage 4b: security hardening
-- ----------------------------------------------------------------------------
-- Apply after 0001_identity.sql. Every statement here is idempotent.
--
-- Three things this fixes:
--   1. Consent tokens were md5 over a UUID — guessable and cheap to brute force
--      for anyone who ever gets a copy of the database. Now 32 random bytes,
--      stored as a SHA-256 hash, and never readable by a client.
--   2. The consent row was client-readable, which would let a minor read their
--      own approval token and self-approve. The policy is gone; the app never
--      needed it.
--   3. Functions in `public` are executable by every role by default. Nothing
--      here should be callable over the API except the two we say so.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. consent tokens
-- ---------------------------------------------------------------------------
-- gen_random_bytes is pgcrypto; Supabase ships it in the `extensions` schema.
create extension if not exists pgcrypto with schema extensions;

alter table public.guardian_consents
  alter column token_hash set default
    encode(extensions.digest(extensions.gen_random_bytes(32), 'sha256'), 'hex');

comment on column public.guardian_consents.token_hash is
  'SHA-256 of a 32-byte random token. The token itself is only ever in the consent email; it is never stored and never sent to a client.';

-- ---------------------------------------------------------------------------
-- 2. the consent row is not client-readable
-- ---------------------------------------------------------------------------
drop policy if exists consents_select_own on public.guardian_consents;

-- ---------------------------------------------------------------------------
-- 3. function permissions
-- ---------------------------------------------------------------------------
-- Postgres grants EXECUTE on new functions to PUBLIC. These are internal —
-- triggers, helpers and a self-service deletion RPC — so the default is
-- revoked and only delete_my_account is handed back to signed-in users.
revoke execute on function public.gow_display_id(text) from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. DPDP right to erasure
-- ---------------------------------------------------------------------------
-- A signed-in user can delete their own account and nothing else. The auth row
-- is the root: accounts, both world profiles and any consent record cascade
-- from it (see the `on delete cascade` in 0001). Runs as the function owner so
-- it can reach auth.users; the only user it can ever touch is auth.uid().
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is
  'Self-service erasure. Deletes the caller''s auth row; accounts and both world profiles cascade.';

-- ---------------------------------------------------------------------------
-- 5. verify
-- ---------------------------------------------------------------------------
-- select proname, proacl from pg_proc
--  where pronamespace = 'public'::regnamespace
--    and proname in ('gow_display_id','touch_updated_at','handle_new_user','delete_my_account');
--
-- Expect: no `=X/` (PUBLIC) entry on the first three; delete_my_account
-- executable by authenticated only.
--
-- select tablename, policyname from pg_policies
--  where schemaname = 'public' order by tablename;
--
-- Expect: select-only policies on accounts, debate_profiles, extempore_profiles
-- and none on guardian_consents.
