import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Speech captures — text now, audio later.
 *
 * The browser transcribes; the server stores. Nothing here trusts the client
 * with an account id: `save_speech_capture` looks the account up from the
 * session, so a tampered form can only ever write against itself.
 */

export type CaptureSource = "speech" | "typed";
export type CaptureKind = "calibration" | "rep";

export type SaveCaptureInput = {
  kind: CaptureKind;
  promptId: string;
  transcript: string;
  durationMs: number;
  source: CaptureSource;
};

export type CaptureRow = {
  prompt_id: string;
  transcript: string;
  word_count: number;
  duration_ms: number;
  source: CaptureSource;
  created_at: string;
  expires_at: string;
};

export async function saveCapture(input: SaveCaptureInput): Promise<{ ok: true } | { ok: false }> {
  const supabase = await createServerSupabase();

  const { error } = await supabase.rpc("save_speech_capture", {
    p_kind: input.kind,
    p_prompt_id: input.promptId,
    p_transcript: input.transcript,
    p_duration_ms: Math.round(input.durationMs),
    p_source: input.source,
  });

  if (error) {
    // Logged, never surfaced as a blocking error: a lost baseline must not cost
    // someone their setup. See completeOnboardingAction.
    console.error("[capture] save_speech_capture failed:", error.code, error.message);
    return { ok: false };
  }

  return { ok: true };
}

/**
 * The caller's newest capture, or null.
 *
 * A missing function (0007 not applied) is treated as "no capture" rather than
 * as an error, so the dashboard still renders on a database mid-migration.
 */
export async function getLatestCapture(kind: CaptureKind = "calibration"): Promise<CaptureRow | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc("my_latest_capture", { p_kind: kind });

  if (error) {
    if (error.code !== "PGRST202") {
      console.error("[capture] my_latest_capture failed:", error.code, error.message);
    }
    return null;
  }

  const row = (Array.isArray(data) ? data[0] : data) as CaptureRow | undefined;
  return row ?? null;
}
