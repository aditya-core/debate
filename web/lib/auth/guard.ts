import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";

export type AccountRow = {
  id: string;
  display_id: string;
  email: string;
  full_name: string | null;
  status: "active" | "pending_guardian_consent" | "suspended";
  created_at: string;
};

export type LearnerRow = {
  account_id: string;
  goals: string[];
  experience: string;
  comfort: number;
  preparing_for: string | null;
  topics: string[];
  minutes_per_day: number;
  practice_window: string;
  target_date: string | null;
  completed_at: string | null;
};

export type AccountContext = {
  userId: string;
  email: string | null;
  account: AccountRow | null;
  learner: LearnerRow | null;
};

/**
 * One round trip, three answers: who is signed in, which account that maps to,
 * and whether they have onboarded.
 *
 * Every authenticated page and action goes through this, so "onboarding is
 * compulsory" is a property of the server, not of a client-side redirect that a
 * determined visitor can drop.
 */
export async function getAccountContext(): Promise<AccountContext | null> {
  if (!isSupabaseConfigured) return null;

  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createServerSupabase();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, display_id, email, full_name, status, created_at")
    .eq("auth_user_id", user.id)
    .maybeSingle<AccountRow>();

  if (!account) {
    return { userId: user.id, email: user.email ?? null, account: null, learner: null };
  }

  const { data: learner } = await supabase
    .from("learner_profiles")
    .select(
      "account_id, goals, experience, comfort, preparing_for, topics, minutes_per_day, practice_window, target_date, completed_at",
    )
    .eq("account_id", account.id)
    .maybeSingle<LearnerRow>();

  return { userId: user.id, email: user.email ?? null, account, learner };
}

export function hasOnboarded(ctx: AccountContext | null): boolean {
  return Boolean(ctx?.learner?.completed_at);
}

/**
 * For pages that must not be seen before onboarding finishes.
 * A signed-out visitor goes to sign-in; a signed-in one goes to the wizard.
 */
export async function requireOnboardedAccount(): Promise<AccountContext & { account: AccountRow }> {
  const ctx = await getAccountContext();

  if (!ctx) redirect("/signin?state=expired");
  if (!ctx.account) redirect("/account");
  if (!hasOnboarded(ctx)) redirect("/onboarding");

  return ctx as AccountContext & { account: AccountRow };
}
