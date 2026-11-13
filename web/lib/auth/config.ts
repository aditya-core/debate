/**
 * Email verification mode.
 *
 *   "off"  no verification hop at all. Sign-up goes straight to the wizard.
 *   "otp"  a six-digit code, generated and stored in Postgres (0005), mailed
 *          through a sender we control (Brevo — free, no domain needed).
 *
 * Why a code instead of a magic link: no redirect URL to allowlist, no deep
 * link, and it works in Gmail's in-app browser, which is where most phones open
 * mail. What it does not remove: something still has to deliver the digits.
 *
 * Switch it on with NEXT_PUBLIC_EMAIL_VERIFICATION_MODE=otp plus BREVO_API_KEY
 * and EMAIL_FROM (see docs/SUPABASE-SETUP.md §5). Turning the mode on without a
 * sender is a trap we detect rather than guess at: in production the code
 * simply is not sent and the page says so.
 */
export type EmailVerificationMode = "off" | "otp";

const raw = process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_MODE;

export const EMAIL_VERIFICATION_MODE: EmailVerificationMode = raw === "otp" ? "otp" : "off";

export const VERIFICATION_ENABLED = EMAIL_VERIFICATION_MODE === "otp";
