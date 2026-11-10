/**
 * Shared state shapes for auth forms.
 *
 * Deliberately NOT in lib/auth/actions.ts: that file carries "use server", and
 * a "use server" module may only export async functions. Exporting a plain
 * object from it throws at runtime — "A 'use server' file can only export async
 * functions, found object" — which is exactly the failure that broke every
 * sign-up submit (M-025). Types are erased at compile time and are fine there;
 * values are not.
 */
export type AuthState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export const INITIAL_STATE: AuthState = { status: "idle" };

/** Result of a verification-code action. `verified` is terminal: the client
 *  plays the success animation and then navigates. */
export type OtpState = {
  status: "idle" | "error" | "sent" | "verified";
  message?: string;
  resendAfter?: number;
  dev?: boolean;
};
