/**
 * Numbers a transcript can honestly produce.
 *
 * Pure, and separate from `capture.ts` on purpose: that module talks to
 * Supabase and therefore to `next/headers`, and anything the dashboard's guide
 * computes must stay importable from a client-rendered component.
 */

/** Words per minute, or null when the sample is too small to mean anything. */
export function wordsPerMinute(wordCount: number, durationMs: number): number | null {
  if (durationMs < 10_000 || wordCount < 5) return null;
  return Math.round(wordCount / (durationMs / 60_000));
}
