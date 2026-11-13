import { createServerSupabase } from "@/lib/supabase/server";
import { sendVerificationCode } from "@/lib/email/send";

export type IssuedCode = {
  generated: boolean;
  sent: boolean;
  dev: boolean;
  resendAfter: number;
  email: string | null;
  name: string | null;
  error?: "no-account" | "no-sender" | "provider-error" | "system-error";
};

/**
 * Ask Postgres for a code, then send it.
 *
 * The code is generated inside the database (0005) and returned to this server
 * function only — it is never serialised to the browser. Cooldown is enforced in
 * SQL, so a resend button that forgets to disable itself still costs nothing.
 */
export async function issueVerificationCode(): Promise<IssuedCode> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc("issue_email_otp");
  if (error) {
    console.error("[otp] issue_email_otp failed:", error.code, error.message);
    return {
      generated: false,
      sent: false,
      dev: false,
      resendAfter: 0,
      email: null,
      name: null,
      error: "system-error",
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const { data: pendingRows, error: pendingError } = await supabase.rpc("my_pending_verification");
  if (pendingError) {
    console.error("[otp] my_pending_verification failed:", pendingError.code, pendingError.message);
    return {
      generated: false,
      sent: false,
      dev: false,
      resendAfter: 0,
      email: null,
      name: null,
      error: "system-error",
    };
  }
  const pending = Array.isArray(pendingRows) ? pendingRows[0] : pendingRows;

  if (!pending) {
    return { generated: false, sent: false, dev: false, resendAfter: 0, email: null, name: null, error: "no-account" };
  }

  const cooldown = Number(row?.resend_after ?? 0);

  // Nothing generated means the cooldown is still running — not an error.
  if (!row?.code) {
    return {
      generated: false,
      sent: false,
      dev: false,
      resendAfter: cooldown,
      email: pending.email,
      name: pending.full_name,
    };
  }

  const result = await sendVerificationCode({
    to: pending.email,
    code: String(row.code),
    name: pending.full_name ?? null,
  });

  if (!result.ok) {
    return {
      generated: true,
      sent: false,
      dev: false,
      resendAfter: cooldown,
      email: pending.email,
      name: pending.full_name,
      error: result.reason === "no-sender" ? "no-sender" : "provider-error",
    };
  }

  return {
    generated: true,
    sent: true,
    dev: "dev" in result ? result.dev : false,
    resendAfter: cooldown,
    email: pending.email,
    name: pending.full_name,
  };
}

export type VerifyOutcome = "ok" | "invalid" | "expired" | "locked" | "none" | "verified";

export async function verifyCode(code: string): Promise<VerifyOutcome> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("verify_email_otp", { p_code: code });

  if (error) {
    console.error("[otp] verify_email_otp failed:", error.code, error.message);
    return "none";
  }

  const status = String(data ?? "none") as VerifyOutcome;
  return status;
}

/** a***@gmail.com — enough to recognise, not enough to harvest. */
export function maskEmail(email: string | null): string {
  if (!email) return "your inbox";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 1);
  return `${head}${"*".repeat(Math.max(2, Math.min(6, local.length - 1)))}@${domain}`;
}
