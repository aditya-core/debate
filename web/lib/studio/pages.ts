import type { AccountContext, AccountRow, LearnerRow } from "@/lib/auth/guard";
import { createServerSupabase } from "@/lib/supabase/server";
import type { World } from "@/lib/dashboard/types";

/**
 * Reads for the studio's non-home pages.
 *
 * Same rules as `lib/dashboard/data.ts`: everything here is either counted from
 * a row or absent. A missing table, a missing function or a half-applied
 * migration degrades to an empty list — never to a 500 on a page someone opened
 * to see their own work.
 */

export type PracticeEvent = {
  id: string;
  kind: "rep" | "baseline";
  /** Null for captures: a transcript has no world until a session wraps it. */
  world: World | null;
  promptId: string;
  words: number | null;
  durationMs: number | null;
  source: "speech" | "typed" | null;
  at: string;
  /** Captures are deleted after their retention window; sessions are not. */
  expiresAt: string | null;
};

export type HistoryData = {
  events: PracticeEvent[];
  /** True when the read itself failed, so the page can say so honestly. */
  incomplete: boolean;
  totals: {
    events: number;
    words: number;
    speakingMs: number;
    firstAt: string | null;
  };
};

type RecentRow = {
  id?: string | null;
  kind: string | null;
  world: string | null;
  prompt_id: string | null;
  word_count: number | null;
  duration_ms: number | null;
  source: string | null;
  at: string | null;
  expires_at?: string | null;
};

const asWorld = (value: string | null): World | null =>
  value === "debate" || value === "extempore" ? value : null;

/**
 * Practice history, newest first.
 *
 * Reads through `my_recent_practice()` (migration 0008): the captures table has
 * no client policies at all, and the sessions tables stay empty until the
 * scorer ships. One function, one shape, one place to change later.
 */
export async function loadHistory(
  ctx: AccountContext & { account: AccountRow },
  limit = 40,
): Promise<HistoryData> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("my_recent_practice", { p_limit: limit });

  if (error) {
    console.error("[history] my_recent_practice failed:", error.code, error.message);
    return {
      events: [],
      incomplete: true,
      totals: { events: 0, words: 0, speakingMs: 0, firstAt: null },
    };
  }

  const rows = (data ?? []) as RecentRow[];
  const events: PracticeEvent[] = rows
    .filter((row) => row.at)
    .map((row, index) => ({
      id: row.id ?? `${row.at}-${index}`,
      kind: row.kind === "baseline" ? "baseline" : "rep",
      world: asWorld(row.world),
      promptId: row.prompt_id ?? "",
      words: row.word_count ?? null,
      durationMs: row.duration_ms ?? null,
      source:
        row.source === "speech" || row.source === "typed" ? row.source : null,
      at: row.at as string,
      expiresAt: row.expires_at ?? null,
    }));

  return {
    events,
    incomplete: false,
    totals: {
      events: events.length,
      words: events.reduce((sum, event) => sum + (event.words ?? 0), 0),
      speakingMs: events.reduce((sum, event) => sum + (event.durationMs ?? 0), 0),
      firstAt: events.length ? events[events.length - 1].at : null,
    },
  };
}

export type AccountPageData = {
  account: AccountRow;
  learner: LearnerRow;
  worlds: Record<
    World,
    { displayId: string | null; rating: number | null; xp: number | null }
  >;
};

export async function loadAccountPageData(
  ctx: AccountContext & { account: AccountRow; learner: LearnerRow },
): Promise<AccountPageData> {
  const supabase = await createServerSupabase();
  const accountId = ctx.account.id;

  const [debate, extempore] = await Promise.all([
    supabase
      .from("debate_profiles")
      .select("display_id, rating, xp")
      .eq("account_id", accountId)
      .maybeSingle<{ display_id: string; rating: number; xp: number }>(),
    supabase
      .from("extempore_profiles")
      .select("display_id, rating, xp")
      .eq("account_id", accountId)
      .maybeSingle<{ display_id: string; rating: number; xp: number }>(),
  ]);

  return {
    account: ctx.account,
    learner: ctx.learner,
    worlds: {
      debate: {
        displayId: debate.data?.display_id ?? null,
        rating: debate.data?.rating ?? null,
        xp: debate.data?.xp ?? null,
      },
      extempore: {
        displayId: extempore.data?.display_id ?? null,
        rating: extempore.data?.rating ?? null,
        xp: extempore.data?.xp ?? null,
      },
    },
  };
}
