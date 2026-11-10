"use server";

import { isSupabaseConfigured } from "@/lib/env";
import { getAccountContext } from "@/lib/auth/guard";
import { issueVerificationCode, verifyCode } from "@/lib/auth/otp";
import type { OtpState } from "@/lib/auth/state";

/**
 * Only async functions may be exported from this file — see
 * scripts/check-server-actions.mjs and M-025.
 */

export async function resendCodeAction(): Promise<OtpState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "The database isn't connected in this environment." };
  }

  const ctx = await getAccountContext();
  if (!ctx) return { status: "error", message: "Your session expired. Sign in again." };
  if (!ctx.account) return { status: "error", message: "Your account row is missing — run the migrations." };

  const issued = await issueVerificationCode();

  if (issued.error === "no-sender") {
    return {
      status: "error",
      message: "We can't send mail yet — our sender isn't configured. This is ours to fix.",
      resendAfter: 0,
    };
  }
  if (issued.error === "provider-error") {
    return {
      status: "error",
      message: "The mail provider refused it. Try again in a minute.",
      resendAfter: 30,
    };
  }

  return {
    status: "sent",
    message: issued.generated
      ? `A new code is on its way to ${issued.email ?? "your inbox"}.`
      : "A code was sent a moment ago. Give it a minute to arrive.",
    resendAfter: issued.resendAfter,
    dev: issued.dev,
  };
}

export async function verifyCodeAction(input: { code: string }): Promise<OtpState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "The database isn't connected in this environment." };
  }

  const ctx = await getAccountContext();
  if (!ctx) return { status: "error", message: "Your session expired. Sign in again." };

  const code = String(input.code ?? "").replace(/\D/g, "").slice(0, 6);
  if (code.length !== 6) {
    return { status: "error", message: "Six digits, no spaces." };
  }

  const outcome = await verifyCode(code);

  switch (outcome) {
    case "ok":
    case "verified":
      return { status: "verified", message: "Verified." };
    case "invalid":
      return { status: "error", message: "That code doesn't match. Check the digits and try again." };
    case "expired":
      return { status: "error", message: "That code expired. Send a new one." };
    case "locked":
      return { status: "error", message: "Too many wrong attempts. Send a new code." };
    default:
      return { status: "error", message: "No code is waiting. Send a new one." };
  }
}
