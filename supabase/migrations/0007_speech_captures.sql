-- ============================================================================
-- 0007 — SPEECH CAPTURES
-- ----------------------------------------------------------------------------
-- The optional baseline check records *text*, not audio. Audio is the honest
-- long-term answer and the wrong first answer: a minute of speech is roughly a
-- megabyte, and every rep would be storage we pay for before we know whether the
-- scoring is worth it. A transcript is a few kilobytes, is what any model would
-- read anyway, and can be deleted on a schedule without anyone losing a score.
--
-- Raw audio column when it arrives:
--   audio_path text, audio_bytes int, audio_mime text
-- The row shape below does not need to change for that.
--
-- Retention: every row carries expires_at, seven days out. A purge runs inside
-- save_speech_capture() on each write, so expiry costs no cron and no money.
--
-- Access: the table has RLS on and *no policies*, and table privileges are
-- revoked from both anon and authenticated. The only doors are the two
-- SECURITY DEFINER functions at the bottom, and both are scoped to auth.uid().
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.speech_captures (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references public.accounts (id) on delete cascade,
  -- 'calibration' is the one-time baseline; 'rep' is a real practice round.
  kind        text not null default 'calibration'
              check (kind in ('calibration', 'rep')),
  prompt_id   text not null check (char_length(prompt_id) between 1 and 64),
  transcript  text not null check (char_length(transcript) between 1 and 4000),
  word_count  int  not null default 0 check (word_count between 0 and 800),
  duration_ms int  not null default 0 check (duration_ms between 0 and 600000),
  source      text not null check (source in ('speech', 'typed')),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '7 days'
);

create index if not exists speech_captures_account_idx
  on public.speech_captures (account_id, created_at desc);
create index if not exists speech_captures_expiry_idx
  on public.speech_captures (expires_at);

alter table public.speech_captures enable row level security;

-- No policies on purpose: RLS with no policy denies everything, and the revoke
-- means there is no path here even if a policy were added by accident.
revoke all on table public.speech_captures from anon, authenticated;

-- ----------------------------------------------------------------------------
-- Write: one capture, for the signed-in caller only.
-- ----------------------------------------------------------------------------
create or replace function public.save_speech_capture(
  p_kind        text,
  p_prompt_id   text,
  p_transcript  text,
  p_duration_ms int,
  p_source      text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid;
  v_clean   text;
  v_words   int;
  v_recent  int;
  v_id      uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;

  select a.id into v_account
    from public.accounts a
   where a.auth_user_id = auth.uid();

  if v_account is null then
    raise exception 'no account for this login' using errcode = '28000';
  end if;

  if p_kind not in ('calibration', 'rep') then
    raise exception 'unknown capture kind' using errcode = '22023';
  end if;
  if p_source not in ('speech', 'typed') then
    raise exception 'unknown capture source' using errcode = '22023';
  end if;

  -- Collapse whitespace first: newlines from a textarea would otherwise count as
  -- words and inflate every denominator we compute from this.
  v_clean := btrim(regexp_replace(coalesce(p_transcript, ''), '\s+', ' ', 'g'));

  if char_length(v_clean) < 1 then
    raise exception 'empty transcript' using errcode = '22023';
  end if;
  if char_length(v_clean) > 4000 then
    v_clean := left(v_clean, 4000);
  end if;

  v_words := coalesce(array_length(regexp_split_to_array(v_clean, '\s+'), 1), 0);

  -- Abuse ceiling. Speech-to-text is free to the client and costs us a row; a
  -- loop should hit a wall rather than a billing page.
  select count(*) into v_recent
    from public.speech_captures c
   where c.account_id = v_account
     and c.created_at > now() - interval '1 day';

  if v_recent >= 20 then
    raise exception 'too many captures in a day' using errcode = '54000';
  end if;

  -- Expiry without a cron job: writing is the only event that matters.
  delete from public.speech_captures where expires_at < now();

  insert into public.speech_captures
    (account_id, kind, prompt_id, transcript, word_count, duration_ms, source)
  values
    (v_account, p_kind, left(p_prompt_id, 64), v_clean, v_words,
     greatest(0, least(coalesce(p_duration_ms, 0), 600000)), p_source)
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.save_speech_capture(text, text, text, int, text) from public, anon;
grant execute on function public.save_speech_capture(text, text, text, int, text) to authenticated;

-- ----------------------------------------------------------------------------
-- Read: the caller's own most recent capture. No account id parameter, because
-- an id parameter is an invitation to enumerate.
-- ----------------------------------------------------------------------------
create or replace function public.my_latest_capture(p_kind text default 'calibration')
returns table (
  prompt_id   text,
  transcript  text,
  word_count  int,
  duration_ms int,
  source      text,
  created_at  timestamptz,
  expires_at  timestamptz
)
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
    select c.prompt_id, c.transcript, c.word_count, c.duration_ms, c.source,
           c.created_at, c.expires_at
      from public.speech_captures c
     where c.account_id = v_account
       and c.kind = p_kind
       and c.expires_at > now()
     order by c.created_at desc
     limit 1;
end;
$$;

revoke execute on function public.my_latest_capture(text) from public, anon;
grant execute on function public.my_latest_capture(text) to authenticated;

-- ----------------------------------------------------------------------------
-- Housekeeping for the case nobody writes again: a capture that expires while
-- the learner is away sits in the table until the next write. This function
-- exists so that can be run by hand or by a scheduler without a migration.
-- ----------------------------------------------------------------------------
create or replace function public.purge_expired_captures()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted int;
begin
  delete from public.speech_captures where expires_at < now();
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke execute on function public.purge_expired_captures() from public, anon, authenticated;
