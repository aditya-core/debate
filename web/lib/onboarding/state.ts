/** Same rule as lib/auth/state.ts — a "use server" module may only export
 *  async functions, so the initial state lives here. */
export type OnboardingState = {
  status: "idle" | "error";
  message?: string;
};

export const ONBOARDING_INITIAL: OnboardingState = { status: "idle" };
