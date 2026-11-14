import type { AccountContext, AccountRow, LearnerRow } from "@/lib/auth/guard";
import { createServerSupabase } from "@/lib/supabase/server";
import { getLatestCapture } from "@/lib/practice/capture";
import { pickPrompt } from "@/lib/practice/prompts";
import type { DashboardData, PathStep, SkillRow, WeekDay, World } from "@/lib/dashboard/types";
import { wordsPerMinute } from "@/lib/practice/metrics";

/**
 * Everything the dashboard shows, in one read.
 *
 * Rules this file follows, because a home screen is where products start lying:
 *   - every number is either counted from a table or absent. There are no
 *     placeholder growth curves here.
 *   - a missing table or a mid-migration database degrades to zero, never to a
 *     500 — someone's home page should survive our deployment order.
 */

export type {
  CaptureSummary,
  DashboardData,
  WeekDay,
  World,
  WorldStat,
} from "@/lib/dashboard/types";
export { WORLD_LABELS } from "@/lib/dashboard/types";

const DAY = 24 * 60 * 60 * 1000;

function isoDay(value: string | Date): string {
  return (value instanceof Date ? value : new Date(value)).toISOString().slice(0, 10);
}

/** Consecutive days ending today, or yesterday if today has not started yet. */
export function streakFrom(isoDates: readonly string[], now = new Date()): number {
  const days = new Set(isoDates);
  let cursor = new Date(now);
  if (!days.has(isoDay(cursor))) {
    cursor = new Date(cursor.getTime() - DAY);
    if (!days.has(isoDay(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(isoDay(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY);
  }
  return streak;
}

export function weekFrom(isoDates: readonly string[], now = new Date()): WeekDay[] {
  const counts = new Map<string, number>();
  for (const iso of isoDates) counts.set(iso, (counts.get(iso) ?? 0) + 1);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() - (6 - index) * DAY);
    const iso = isoDay(date);
    return {
      iso,
      label: date.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2),
      reps: counts.get(iso) ?? 0,
    };
  });
}

type SessionRow = { started_at: string };

export async function loadDashboard(
  ctx: AccountContext & { account: AccountRow },
): Promise<DashboardData> {
  const learner = ctx.learner as LearnerRow;
  const supabase = await createServerSupabase();
  const accountId = ctx.account.id;

  const [debateProfile, extemporeProfile, debateSessions, extemporeSessions, capture] =
    await Promise.all([
      supabase
        .from("debate_profiles")
        .select("rating, xp")
        .eq("account_id", accountId)
        .maybeSingle<{ rating: number; xp: number }>(),
      supabase
        .from("extempore_profiles")
        .select("rating, xp")
        .eq("account_id", accountId)
        .maybeSingle<{ rating: number; xp: number }>(),
      supabase
        .from("debate_sessions")
        .select("started_at")
        .eq("account_id", accountId)
        .order("started_at", { ascending: false })
        .limit(200),
      supabase
        .from("extempore_sessions")
        .select("started_at")
        .eq("account_id", accountId)
        .order("started_at", { ascending: false })
        .limit(200),
      getLatestCapture("calibration"),
    ]);

  const debateRows = (debateSessions.data ?? []) as SessionRow[];
  const extemporeRows = (extemporeSessions.data ?? []) as SessionRow[];
  const allDates = [...debateRows, ...extemporeRows].map((row) => isoDay(row.started_at));

  const reps = debateRows.length + extemporeRows.length;
  const wpm = capture ? wordsPerMinute(capture.word_count, capture.duration_ms) : null;

  /**
   * Progress is four real gates, 25 each — not a made-up percentage. It is
   * deliberately slow to reach 100: the last gate needs three reps.
   */
  const gates = [true, Boolean(capture), reps >= 1, reps >= 3];
  const percent = gates.filter(Boolean).length * 25;

  const path: PathStep[] = [
    { key: "setup", label: "Setup", state: "done" },
    { key: "baseline", label: "Baseline", state: capture ? "done" : "current" },
    {
      key: "first-rep",
      label: "First rep",
      state: !capture ? "next" : reps >= 1 ? "done" : "current",
    },
    { key: "scored", label: "Scored rep", state: reps >= 1 ? "next" : "locked" },
    { key: "feedback", label: "Feedback", state: "locked" },
    { key: "level", label: "Next level", state: "locked" },
  ];

  /**
   * The four rows the design gives percentages to. Two of them we can actually
   * measure today (pace and length of the baseline); the two that need scored
   * reps say so instead of inventing a number.
   */
  const skills: SkillRow[] = [
    {
      key: "pace",
      label: "Pace",
      value: wpm ? Math.min(100, Math.round((wpm / 170) * 100)) : null,
      note: wpm ? `${wpm} words a minute` : "Needs a spoken baseline",
    },
    {
      key: "length",
      label: "Sustained speech",
      value: capture ? Math.min(100, Math.round((capture.word_count / 150) * 100)) : null,
      note: capture ? `${capture.word_count} words in ${Math.round(capture.duration_ms / 1000)}s` : "Needs a baseline",
    },
    {
      key: "structure",
      label: "Structure",
      value: null,
      note: "Unlocks with the first scored rep",
    },
    {
      key: "evidence",
      label: "Evidence",
      value: null,
      note: "Unlocks with the first scored rep",
    },
  ];

  const now = new Date();
  const seed = {
    accountKey: ctx.account.display_id,
    topics: learner.topics,
    goals: learner.goals,
    day: isoDay(now),
  };

  return {
    firstName: ctx.account.full_name?.trim().split(/\s+/)[0] ?? null,
    displayId: ctx.account.display_id,
    memberSince: ctx.account.created_at,
    learner: {
      goals: learner.goals,
      experience: learner.experience,
      comfort: learner.comfort,
      topics: learner.topics,
      minutesPerDay: learner.minutes_per_day,
      practiceWindow: learner.practice_window,
      targetDate: learner.target_date,
    },
    worlds: {
      debate: {
        rating: debateProfile.data?.rating ?? 1000,
        xp: debateProfile.data?.xp ?? 0,
        reps: debateRows.length,
      },
      extempore: {
        rating: extemporeProfile.data?.rating ?? 1000,
        xp: extemporeProfile.data?.xp ?? 0,
        reps: extemporeRows.length,
      },
    },
    totals: {
      reps: debateRows.length + extemporeRows.length,
      streak: streakFrom(allDates, now),
      xp: (debateProfile.data?.xp ?? 0) + (extemporeProfile.data?.xp ?? 0),
    },
    week: {
      debate: weekFrom(debateRows.map((row) => isoDay(row.started_at)), now),
      extempore: weekFrom(extemporeRows.map((row) => isoDay(row.started_at)), now),
    },
    capture,
    progress: { percent, level: 1 + Math.floor(reps / 10) },
    path,
    skills,
    metrics: { words: capture?.word_count ?? null, wpm },
    today: {
      debate: pickPrompt({ ...seed, format: "debate" }).prompt,
      extempore: pickPrompt({ ...seed, format: "extempore" }).prompt,
    },
  };
}
