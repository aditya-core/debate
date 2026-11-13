import type { AccountContext, AccountRow, LearnerRow } from "@/lib/auth/guard";
import { createServerSupabase } from "@/lib/supabase/server";
import { getLatestCapture, type CaptureRow } from "@/lib/practice/capture";
import { pickPrompt, type Prompt } from "@/lib/practice/prompts";

/**
 * Everything the dashboard shows, in one read.
 *
 * Rules this file follows, because a home screen is where products start lying:
 *   - every number is either counted from a table or absent. There are no
 *     placeholder growth curves here.
 *   - a missing table or a mid-migration database degrades to zero, never to a
 *     500 — someone's home page should survive our deployment order.
 */

export type WorldStat = {
  rating: number;
  xp: number;
  reps: number;
};

export type WeekDay = { label: string; iso: string; reps: number };

export type DashboardData = {
  firstName: string | null;
  displayId: string;
  memberSince: string;
  learner: {
    goals: string[];
    experience: string;
    comfort: number;
    topics: string[];
    minutesPerDay: number;
    practiceWindow: string;
    targetDate: string | null;
  };
  worlds: { debate: WorldStat; extempore: WorldStat };
  totals: { reps: number; streak: number; xp: number };
  week: WeekDay[];
  capture: CaptureRow | null;
  today: Prompt;
};

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

  const now = new Date();
  const today = pickPrompt({
    accountKey: ctx.account.display_id,
    topics: learner.topics,
    goals: learner.goals,
    day: isoDay(now),
  });

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
    week: weekFrom(allDates, now),
    capture,
    today: today.prompt,
  };
}
