import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FirstRep from "@/components/practice/FirstRep";
import { requireOnboardedAccount } from "@/lib/auth/guard";
import { EXPERIENCE_LABELS, GOAL_LABELS, WINDOW_LABELS } from "@/lib/onboarding/schema";
import { pickPrompt } from "@/lib/practice/prompts";

export const metadata: Metadata = {
  title: "Your first rep — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Where setup ends.
 *
 * Before this page existed, finishing the wizard landed on /account: a page of
 * identifiers and ratings that told a new learner nothing about what to do next.
 * Now the last step hands over one prompt built from the answers just given, and
 * a timer, so the first thing anyone does in the product is speak.
 */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ take?: string }>;
}) {
  const { take: takeParam } = await searchParams;
  const take = Math.min(48, Math.max(0, Number.parseInt(takeParam ?? "0", 10) || 0));

  const { account, learner } = await requireOnboardedAccount();
  // Unreachable through requireOnboardedAccount, but a 500 is worse than a redirect.
  if (!learner) redirect("/onboarding");

  const firstName = account.full_name?.trim().split(/\s+/)[0] ?? null;

  // The day is part of the seed, so the prompt is stable through a day and
  // different tomorrow — variety without a database column for it.
  const { prompt, reason } = pickPrompt({
    accountKey: account.display_id,
    topics: learner.topics,
    goals: learner.goals,
    day: new Date().toISOString().slice(0, 10),
    take,
  });

  return (
    <FirstRep
      firstName={firstName}
      accountId={account.display_id}
      prompt={prompt}
      reason={reason}
      take={take}
      goals={learner.goals
        .map((goal) => GOAL_LABELS[goal as keyof typeof GOAL_LABELS]?.label)
        .filter(Boolean)
        .join(" · ")}
      experience={
        EXPERIENCE_LABELS[learner.experience as keyof typeof EXPERIENCE_LABELS]?.label ?? ""
      }
      comfort={learner.comfort}
      minutesPerDay={learner.minutes_per_day}
      practiceWindow={
        WINDOW_LABELS[learner.practice_window as keyof typeof WINDOW_LABELS] ?? "Evening"
      }
    />
  );
}
