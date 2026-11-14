-- ============================================================================
-- Gift of Words — 0008: keep every onboarding answer, and give the studio a
--                      history read that cannot enumerate anyone
-- ----------------------------------------------------------------------------
-- Apply after 0001 → 0007, in order.
--
-- Why this exists
--   1. `learner_profiles` holds the CURRENT answers. That is right for the coach
--      and wrong for the record: if someone edits their plan in month three we
--      can no longer answer "what did they tell us when they started?" — which is
--      exactly the question a personalised path needs, and the question a DPDP
--      access request asks. This adds an append-only log beside the live row.
--      The live row stays the fast read; the log is the truth.
--
--   2. `/history` needs to list what someone actually did. `speech_captures`
--      has RLS on with no policies at all and its table privileges are revoked,
--      and the session tables are empty until the scorer ships. One SECURITY
--      DEFINER function returns both, scoped to the caller, with no account id
--      parameter — an id parameter is an invitation to enumerate.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. the record of what was said, not just the latest version of it
-- ---------------------------------------------------------------------------
create table if not exists public.onboarding_submissions (
  id                 bigint generated always as identity primary key,
  account_id         uuid not null references public.accounts (id) on delete cascade,
  answers            jsonb not null,
  onboarding_version smallint not null default 1,
  submitted_at       timestamptz not null default now()
);

comment on table public.onboarding_submissions is
  'Append-only log of every onboarding payload. Written by trigger, never by a client. Answers in onboarding_submissions are immutable.';

create index if not exists onboarding_submissions_account_idx
  on public.onboarding_submissions (account_id, submitted_at desc);

alter table public.onboarding_submissions enable row level security;

-- Read your own submissions, nothing else. There is deliberately no insert,
-- update or delete policy: rows are written by the trigger below and can never
-- be altered afterwards, by us or by the learner.
drop policy if exists onboarding_submissions_select_own on public.onboarding_submissions;
create policy onboarding_submissions_select_own on public.onboarding_submissions
  for select to authenticated
  using (
    exists (
      select 1 from public.accounts a
       where a.id = account_id and a.auth_user_id = auth.uid()
    )
  );

revoke all on public.onboarding_submissions from anon, authenticated;
grant select on public.onboarding_submissions to authenticated;

-- ---------------------------------------------------------------------------
-- 2. the trigger that writes it
-- ---------------------------------------------------------------------------
-- A trigger rather than a line inside complete_onboarding(): the function may be
-- replaced by a later migration, and the record should survive that. Anything
-- that touches learner_profiles.answers is logged, including a future re-edit
-- path that does not exist yet.
create or replace function public.log_onboarding_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.onboarding_submissions (account_id, answers, onboarding_version)
  values (new.account_id, new.answers, new.onboarding_version);
  return null;
end;
$$;

revoke execute on function public.log_onboarding_submission() from public, anon, authenticated;

drop trigger if exists learner_profiles_log_answers on public.learner_profiles;
create trigger learner_profiles_log_answers
  after insert or update of answers on public.learner_profiles
  for each row execute function public.log_onboarding_submission();

-- ---------------------------------------------------------------------------
-- 3. practice history for the signed-in caller
-- ---------------------------------------------------------------------------
-- Captures carry no world (they are one prompt and one transcript), so `world`
-- is null for them and the UI must not invent one. Sessions do carry a world
-- because they belong to a world's profile.
create or replace function public.my_recent_practice(p_limit int default 30)
returns table (
  id          uuid,
  kind        text,
  world       text,
  prompt_id   text,
  word_count  int,
  duration_ms int,
  source      text,
  at          timestamptz,
  expires_at  timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select a.id from public.accounts a where a.auth_user_id = auth.uid()
  )
  select c.id                                  as id,
         case when c.kind = 'calibration'
              then 'baseline' else 'rep' end   as kind,
         null::text                            as world,
         c.prompt_id                           as prompt_id,
         c.word_count                          as word_count,
         c.duration_ms                         as duration_ms,
         c.source                              as source,
         c.created_at                          as at,
         c.expires_at                          as expires_at
    from public.speech_captures c
    join me on me.id = c.account_id

  union all

  select s.id,
         'rep',
         'debate',
         coalesce(s.payload ->> 'prompt_id', ''),
         nullif(s.payload ->> 'word_count', '')::int,
         nullif(s.payload ->> 'duration_ms', '')::int,
         s.payload ->> 'source',
         s.started_at,
         null::timestamptz
    from public.debate_sessions s
    join me on me.id = s.account_id

  union all

  select s.id,
         'rep',
         'extempore',
         coalesce(s.payload ->> 'prompt_id', ''),
         nullif(s.payload ->> 'word_count', '')::int,
         nullif(s.payload ->> 'duration_ms', '')::int,
         s.payload ->> 'source',
         s.started_at,
         null::timestamptz
    from public.extempore_sessions s
    join me on me.id = s.account_id

  -- M-036: `order by at desc` failed with 42703 here. In a UNION the ORDER BY
  -- may only use *output* column names, and the first branch was unaliased, so
  -- the ninth column was called `expires_at` and nothing was called `at`. The
  -- branches are aliased above for the reader; the sort uses the ordinal so a
  -- future rename of a column cannot break it again.
  order by 8 desc
  limit least(greatest(coalesce(p_limit, 30), 1), 100);
$$;

revoke execute on function public.my_recent_practice(int) from public, anon;
grant execute on function public.my_recent_practice(int) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. verify (run as the logged-in learner)
-- ---------------------------------------------------------------------------
-- a) the log has one row per onboarding, including re-edits:
--   select submitted_at, onboarding_version
--     from public.onboarding_submissions order by submitted_at desc limit 5;
--
-- b) the live row still holds the current answers:
--   select goals, minutes_per_day, updated_at from public.learner_profiles;
--
-- c) history returns only your rows — there is no account id to pass:
--   select kind, world, word_count, at from public.my_recent_practice(10);
--
-- d) nobody can write the log directly (0 rows, no error):
--   update public.onboarding_submissions set answers = '{}'::jsonb;
--
-- e) RLS is on for both objects:
--   select relname, relrowsecurity from pg_class
--    where relname in ('onboarding_submissions', 'learner_profiles');
