"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getAccountContext } from "@/lib/auth/guard";
import { createServerSupabase } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/onboarding/schema";
import { saveCapture, type CaptureSource } from "@/lib/practice/capture";

import type { OnboardingState } from "@/lib/onboarding/state";
/**
 * The only way a learner profile is written.
 *
 * The wizard posts its answers as one JSON field. We re-validate with the same
 * schema the UI used, then hand it to the SQL function, which validates again
 * and stamps completed_at. Nothing here trusts the client, and nothing here can
 * mark someone onboarded who did not answer the questions.
 */
export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Onboarding isn't switched on in this environment yet — the database connection hasn't been configured.",
    };
  }

  const ctx = await getAccountContext();
  if (!ctx) redirect("/signin?state=expired");
  if (!ctx.account) {
    return {
      status: "error",
      message:
        "Your login exists but your account row doesn't. The identity migration hasn't been applied to this project.",
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("answers") ?? "{}"));
  } catch {
    return { status: "error", message: "Those answers couldn't be read. Reload and try again." };
  }

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Something in those answers isn't valid.",
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("complete_onboarding", {
    p_answers: {
      goals: parsed.data.goals,
      experience: parsed.data.experience,
      comfort: parsed.data.comfort,
      preparingFor: parsed.data.preparingFor,
      topics: parsed.data.topics,
      minutesPerDay: parsed.data.minutesPerDay,
      practiceWindow: parsed.data.practiceWindow,
      targetDate: parsed.data.targetDate,
    },
  });

  if (error) {
    // Logged server-side only: the learner gets a sentence, the log gets the
    // code, so a failing RPC is diagnosable without leaking schema details.
    console.error("[onboarding] complete_onboarding failed:", error.code, error.message);
    return {
      status: "error",
      message: "We couldn't save that. Please try once more.",
    };
  }

  // The first rep, not a receipt. Setup ends by handing over something to do.
  // -------------------------------------------------------------------------
  // The optional baseline. Written after the profile, because a lost transcript
  // must never cost someone their setup — so a failure here is logged and the
  // learner still lands on their dashboard.
  // -------------------------------------------------------------------------
  const transcript = String(formData.get("transcript") ?? "").trim().slice(0, 4000);
  const promptId = String(formData.get("promptId") ?? "").trim().slice(0, 64);
  const durationMs = Math.max(0, Math.min(600_000, Number(formData.get("durationMs") ?? 0) || 0));
  const source: CaptureSource = formData.get("captureSource") === "speech" ? "speech" : "typed";

  if (transcript.length > 0 && promptId.length > 0) {
    await saveCapture({
      kind: "calibration",
      promptId,
      transcript,
      durationMs,
      source,
    });
  }

  // Home. /welcome is a place you visit from here, not a corridor you must pass.
  redirect("/dashboard");
}
