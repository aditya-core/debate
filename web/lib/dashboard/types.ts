/**
 * Dashboard types and world labels.
 *
 * Pure by design: this file is imported by a client component (the world switch
 * lives in the browser), so it must not reach `next/headers` through `data.ts`,
 * which queries Supabase.
 */

import type { Prompt } from "@/lib/practice/prompts";

export type World = "debate" | "extempore";

export const WORLD_LABELS: Record<World, { name: string; verb: string; blurb: string }> = {
  debate: {
    name: "Debate",
    verb: "Argue it",
    blurb: "Take a side, hold it, answer the objection.",
  },
  extempore: {
    name: "Extempore",
    verb: "Speak it",
    blurb: "A minute to think, two to speak, nothing to hide behind.",
  },
};

export type WorldStat = {
  rating: number;
  xp: number;
  reps: number;
};

export type WeekDay = { label: string; iso: string; reps: number };

/** The part of a capture the UI needs — no transcript. */
export type CaptureSummary = {
  word_count: number;
  duration_ms: number;
  source: "speech" | "typed";
  created_at: string;
  expires_at: string;
};

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
  worlds: Record<World, WorldStat>;
  totals: { reps: number; streak: number; xp: number };
  /** One series per world: a debate week and an extempore week are not a total. */
  week: Record<World, WeekDay[]>;
  capture: CaptureSummary | null;
  /** Both worlds resolved up front, so switching costs no round trip. */
  today: Record<World, Prompt>;
};
