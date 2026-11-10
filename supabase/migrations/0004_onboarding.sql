-- ============================================================================
-- Gift of Words — Stage 4d: onboarding, and a learner profile built to be
--                           read by an AI tutor later
-- ----------------------------------------------------------------------------
-- Apply after 0001, 0002 and 0003, in order.
--
-- Why this exists
--   A confirmed account currently knows only a name, a birthday and an email.
--   An AI coach given that can do nothing useful. This file records what the
--   learner is actually preparing for, how they rate themselves, what they want
--   to talk about, and how much time they will give us — in typed columns, so
--   it can be queried and aggregated, with the raw answers kept alongside as an
--   immutable snapshot.
--
-- The structure, deliberately:
--   typed columns  → queryable, indexable, aggregatable (spaced repetition,
--                    cohort stats, effort estimates)
--   answers jsonb  → the exact submission, untouched, so a change to the wizard
--                    never loses what someone actually said
--   learner_brief()→ one stable text block for prompt injection, so every
--                    feature asks the same question the same way
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. the table
-- ---------------------------------------------------------------------------
create table if not exists public.learner_profiles (
  account_id      uuid primary key references public.accounts (id) on delete cascade,

  -- what they want out of this
  goals           text[] not null default '{}'::text[]
    check (goals <@ array['confidence', 'interview', 'debate', 'academics', 'career', 'everyday']::text[]),
  experience      text not null default 'just_starting'
    check (experience in ('just_starting', 'some_practice', 'comfortable')),
  comfort         smallint not null default 3
    check (comfort between 1 and 5),

  -- what they are walking into (free text, capped)
  preparing_for   text
    check (preparing_for is null or char_length(preparing_for) <= 280),
  target_date     date,

  -- what to put in front of them
  topics          text[] not null default '{}'::text[]
    check (topics <@ array['technology', 'society', 'education', 'environment', 'geopolitics',
                          'sport', 'health', 'science', 'economy', 'culture', 'ethics', 'ai']::text[]),

  -- how much of their week to plan around
  minutes_per_day smallint not null default 15
    check (minutes_per_day between 5 and 120),
  practice_window text not null default 'evening'
    check (practice_window in ('morning', 'afternoon', 'evening', 'late_night')),

  -- the audit trail
  answers         jsonb not null default '{}'::jsonb,
  onboarding_version smallint not null default 1,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.learner_profiles is
  'One row per account, written only through complete_onboarding(). Typed columns for queries, answers for the record.';

-- ---------------------------------------------------------------------------
-- 2. write path: one function, so validation cannot be bypassed
-- ---------------------------------------------------------------------------
-- The browser never inserts here. It calls this with a JSON payload; the
-- function validates, normalises, and stamps completion. That means
-- completed_at can never be set by a client that skipped the questions.
create or replace function public.complete_onboarding(p_answers jsonb)
returns public.learner_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account   uuid;
  v_goals     text[];
  v_topics    text[];
  v_experience text := coalesce(p_answers ->> 'experience', 'just_starting');
  v_comfort   smallint := coalesce((p_answers ->> 'comfort')::smallint, 3);
  v_preparing text := nullif(btrim(coalesce(p_answers ->> 'preparingFor', '')), '');
  v_minutes   smallint := coalesce((p_answers ->> 'minutesPerDay')::smallint, 15);
  v_window    text := coalesce(p_answers ->> 'practiceWindow', 'evening');
  v_target    date := nullif(p_answers ->> 'targetDate', '')::date;
  v_row       public.learner_profiles;
begin
  if auth.uid() is null then
    raise exception 'complete_onboarding: not authenticated' using errcode = '28000';
  end if;

  select id into v_account from public.accounts where auth_user_id = auth.uid();
  if v_account is null then
    raise exception 'complete_onboarding: no account row for this user (run 0001 -> 0003)'
      using errcode = '23503';
  end if;

  v_goals := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_answers -> 'goals', '[]'::jsonb))),
    '{}'::text[]
  );
  v_topics := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_answers -> 'topics', '[]'::jsonb))),
    '{}'::text[]
  );

  if array_length(v_goals, 1) is null then
    raise exception 'complete_onboarding: at least one goal is required'
      using errcode = '22023';
  end if;

  if v_preparing is not null and char_length(v_preparing) > 280 then
    raise exception 'complete_onboarding: preparing_for is too long' using errcode = '22001';
  end if;

  insert into public.learner_profiles as lp
    (account_id, goals, experience, comfort, preparing_for, topics,
     minutes_per_day, practice_window, target_date, answers, completed_at, updated_at)
  values
    (v_account, v_goals, v_experience, v_comfort, v_preparing, v_topics,
     v_minutes, v_window, v_target, coalesce(p_answers, '{}'::jsonb), now(), now())
  on conflict (account_id) do update set
    goals           = excluded.goals,
    experience      = excluded.experience,
    comfort         = excluded.comfort,
    preparing_for   = excluded.preparing_for,
    topics          = excluded.topics,
    minutes_per_day = excluded.minutes_per_day,
    practice_window = excluded.practice_window,
    target_date     = excluded.target_date,
    answers         = excluded.answers,
    -- completing twice keeps the first completion time: a learner editing
    -- their answers later has still been onboarded since the first time.
    completed_at    = coalesce(lp.completed_at, now()),
    updated_at      = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.complete_onboarding(jsonb) from public, anon;
grant execute on function public.complete_onboarding(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. read path for the AI
-- ---------------------------------------------------------------------------
-- One function, one format. When the tutor prompt is built in Stage 5 it calls
-- this instead of re-deriving the shape from five columns, so a prompt written
-- today is not silently wrong next month.
create or replace function public.learner_brief(p_account uuid)
returns text
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  r record;
  v text;
begin
  select a.full_name, a.display_id, l.goals, l.experience, l.comfort, l.preparing_for,
         l.topics, l.minutes_per_day, l.practice_window, l.target_date
    into r
    from public.accounts a
    join public.learner_profiles l on l.account_id = a.id
   where a.id = p_account;

  if not found then
    return null;
  end if;

  v := concat_ws(E'\n',
    'Learner: ' || coalesce(r.full_name, 'unnamed') || ' (' || r.display_id || ')',
    'Working towards: ' || case
        when r.goals is null or cardinality(r.goals) = 0 then 'not stated'
        else array_to_string(r.goals, ', ') end,
    'Experience: ' || r.experience || ', self-rated confidence ' || r.comfort || '/5',
    case when r.preparing_for is null then null
         else 'Preparing for: ' || r.preparing_for end,
    case when r.target_date is null then null
         else 'Deadline: ' || to_char(r.target_date, 'DD Mon YYYY') end,
    case when r.topics is null or cardinality(r.topics) = 0 then null
         else 'Preferences: ' || array_to_string(r.topics, ', ') end,
    'Budget: ' || r.minutes_per_day || ' minutes a day, usually ' || r.practice_window
  );

  return v;
end;
$$;

comment on function public.learner_brief(uuid) is
  'Stable text block for prompt injection. Returns null if the learner has not onboarded.';

grant execute on function public.learner_brief(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. row level security
-- ---------------------------------------------------------------------------
alter table public.learner_profiles enable row level security;

-- Read your own. There is deliberately no insert/update/delete policy: writes
-- go through complete_onboarding(), which is the only place completion is
-- stamped. Direct DML is revoked below, so the absence of policies is belt and
-- braces rather than the only protection.
drop policy if exists learner_profiles_select_own on public.learner_profiles;
create policy learner_profiles_select_own on public.learner_profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.accounts a
       where a.id = account_id and a.auth_user_id = auth.uid()
    )
  );

revoke insert, update, delete on public.learner_profiles from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. verify
-- ---------------------------------------------------------------------------
-- a) a learner who has not onboarded has no row at all:
--   select count(*) from public.learner_profiles;              -- 0 on first run
--
-- b) after a real onboarding, this returns the brief:
--   select public.learner_brief(id) from public.accounts order by created_at desc limit 1;
--
-- c) RLS is on and there is exactly one policy (select):
--   select rowsecurity,
--          (select count(*) from pg_policies
--            where schemaname='public' and tablename='learner_profiles') as policies
--     from pg_tables where schemaname='public' and tablename='learner_profiles';
--   -- rowsecurity = true, policies = 1
--
-- d) a client cannot write directly (run as the logged-in user):
--   update public.learner_profiles set comfort = 5;             -- 0 rows affected
