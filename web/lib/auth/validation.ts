/**
 * Rules shared by the sign-up form (instant feedback) and the server action
 * (the authority). Pure functions, no imports — the form must never disagree
 * with the server about whether someone is 17 or 18.
 */

/** Legal age of independent consent in India (DPDP) — also our product floor. */
export const ADULT_AGE = 18;
export const MIN_AGE = 13;

/**
 * Whole years between a `YYYY-MM-DD` date and `now`, or null if the string
 * isn't a date. UTC throughout so the result doesn't change with the server's
 * timezone.
 */
export function ageFrom(dob: string, now: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;

  const [year, month, day] = dob.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));

  // `Date` silently rolls 31 February over into March. Round-trip the parts so
  // an impossible date is rejected instead of becoming a plausible one.
  if (
    Number.isNaN(d.getTime()) ||
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }

  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - d.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < d.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export type PasswordStrength = { score: 0 | 1 | 2 | 3 | 4; label: string };

const LABELS = ["Too short", "Weak", "Fair", "Strong", "Excellent"];

/**
 * A hint, not a gate — the hard requirements live in the zod schema. This only
 * exists so the bar under the field can move while someone types.
 */
export function passwordScore(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 10) score++;
  if (pw.length >= 14) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return { score: score as PasswordStrength["score"], label: LABELS[score] };
}
