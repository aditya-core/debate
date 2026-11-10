/**
 * Email verification — PAUSED ON PURPOSE (D-077, 2026-11-10).
 *
 * Aditya asked for the verification hop to stay built but be out of the way
 * until he switches it on. So: the code path is intact, the flag is the only
 * thing standing in front of it.
 *
 * TO SWITCH IT ON — two places, both required:
 *   1. here:  REQUIRE_EMAIL_CONFIRMATION = true   (or set
 *             NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=true in the environment)
 *   2. Supabase → Authentication → Sign In / Providers → Email →
 *      "Confirm email" ON, and a working SMTP sender (see
 *      docs/SUPABASE-SETUP.md §5).
 *
 * Doing only one of them produces a confusing half-state, so the sign-up action
 * logs a warning if it ever sees them disagree.
 *
 * What "paused" costs: anyone can type an address they do not own and end up
 * with an account. That is acceptable while the only accounts are ours. It is
 * not acceptable for a public launch, and it is recorded as an accepted risk in
 * docs/SECURITY.md (A-08).
 */
const raw = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION;

export const REQUIRE_EMAIL_CONFIRMATION = raw === "true";
