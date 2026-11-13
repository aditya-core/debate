import type { DashboardData } from "@/lib/dashboard/data";
import { CALIBRATION_SECONDS } from "@/lib/practice/calibration";
import { wordsPerMinute } from "@/lib/practice/metrics";

/**
 * The guide, until the mentor exists.
 *
 * What ships today is rule-based advice computed from what actually happened:
 * a baseline that exists or doesn't, reps that exist or don't, a streak that is
 * real. It is deliberately not dressed up as a conversation — a chat box that
 * cannot answer is worse than no chat box. When the scoring engine lands, this
 * function is the fallback and the prompts it needs are already in this shape.
 */

export type GuideItem = {
  title: string;
  body: string;
  href: string;
  cta: string;
};

export function buildGuide(data: DashboardData): GuideItem[] {
  const items: GuideItem[] = [];
  const { capture, totals, learner } = data;

  if (!capture) {
    items.push({
      title: "Give day one a starting line",
      body: `The optional baseline is ${CALIBRATION_SECONDS} seconds of speaking, stored as text. Without it, your first score has nothing to be compared with — including your own.`,
      href: "/onboarding?edit=1",
      cta: "Record the baseline",
    });
  } else if (totals.reps === 0) {
    const wpm = wordsPerMinute(capture.word_count, capture.duration_ms);
    items.push({
      title: "You have a baseline. Now give it a shape",
      body: `${capture.word_count} words in your baseline${wpm ? `, about ${wpm} a minute` : ""}. Word count is the easiest thing to fix and the least important: today, practise structure — claim, reason, example — instead of speed.`,
      href: "/welcome",
      cta: "Start today's rep",
    });
  } else if (totals.streak === 0) {
    items.push({
      title: "Today is still empty",
      body: `You have ${totals.reps} ${totals.reps === 1 ? "rep" : "reps"} behind you and none today. ${learner.minutesPerDay} minutes was the promise — one rep counts.`,
      href: "/welcome",
      cta: "Do one rep",
    });
  } else {
    items.push({
      title: `${totals.streak} ${totals.streak === 1 ? "day" : "days"} in a row`,
      body: "Consistency is doing the work here, not intensity. Add today's rep before the streak becomes a memory.",
      href: "/welcome",
      cta: "Add today's rep",
    });
  }

  if (learner.comfort <= 2) {
    items.push({
      title: "Low confidence is a starting condition, not a verdict",
      body: "You told us speaking is hard right now. On those days, the useful rep is shorter and out loud — not longer and silent. Fifteen seconds, said aloud, beats five minutes of planning.",
      href: "/welcome",
      cta: "Take a short rep",
    });
  } else if (learner.targetDate) {
    items.push({
      title: "There is a date on this",
      body: `You are working towards ${new Date(`${learner.targetDate}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. Count backwards from it: what has to be automatic by then?`,
      href: "/welcome",
      cta: "Practise that",
    });
  } else {
    items.push({
      title: "Say it out loud, once, before you judge it",
      body: "The gap between the sentence in your head and the sentence in the room is the whole skill. One rep closes more of it than an hour of reading about it.",
      href: "/welcome",
      cta: "One rep",
    });
  }

  return items;
}
