import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Wizard from "@/components/onboarding/Wizard";
import { getAccountContext, hasOnboarded } from "@/lib/auth/guard";
import { isSupabaseConfigured } from "@/lib/env";
import type { OnboardingAnswers } from "@/lib/onboarding/schema";

export const metadata: Metadata = {
  title: "Set up your practice — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fromLearner(row: {
  goals: string[];
  experience: string;
  comfort: number;
  preparing_for: string | null;
  topics: string[];
  minutes_per_day: number;
  practice_window: string;
  target_date: string | null;
}): Partial<OnboardingAnswers> {
  return {
    goals: row.goals as OnboardingAnswers["goals"],
    experience: row.experience as OnboardingAnswers["experience"],
    comfort: row.comfort,
    preparingFor: row.preparing_for ?? "",
    topics: row.topics as OnboardingAnswers["topics"],
    minutesPerDay: row.minutes_per_day,
    practiceWindow: row.practice_window as OnboardingAnswers["practiceWindow"],
    targetDate: row.target_date ?? "",
  };
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const isEdit = edit === "1";

  if (!isSupabaseConfigured) redirect("/signin?state=unconfigured");

  const ctx = await getAccountContext();
  if (!ctx) redirect("/signin");

  if (!ctx.account) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-[1.6rem] font-medium tracking-[-0.02em] text-fg">
          Your login exists, your account row doesn&apos;t.
        </h1>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
          The auth user was created but the identity migration never ran. Apply{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.82rem]">
            0001 → 0004
          </code>{" "}
          in order, then reload this page.
        </p>
        <Link href="/" className="btn btn-outline btn-sm mt-7">
          Back to the homepage
        </Link>
      </div>
    );
  }

  // Already done and not deliberately editing: the wizard is not a place to
  // browse, it is a gate that has been passed.
  if (hasOnboarded(ctx) && !isEdit) redirect("/account");

  const firstName = ctx.account.full_name?.trim().split(/\s+/)[0] ?? null;

  return (
    <Wizard
      mode={isEdit && hasOnboarded(ctx) ? "edit" : "onboarding"}
      firstName={firstName}
      accountId={ctx.account.display_id}
      initial={ctx.learner ? fromLearner(ctx.learner) : undefined}
    />
  );
}
