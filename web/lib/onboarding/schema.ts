import { z } from "zod";

/**
 * One definition of the onboarding answers, shared by the wizard (client-side
 * step validation) and the server action (authority).
 *
 * The SQL function validates again. That is not redundancy for its own sake:
 * the client copy exists so a person sees the problem on the step they are on,
 * and the server copy exists because the client cannot be trusted.
 */

export const GOALS = [
  "confidence",
  "interview",
  "debate",
  "academics",
  "career",
  "everyday",
] as const;

export const EXPERIENCE = ["just_starting", "some_practice", "comfortable"] as const;

export const TOPICS = [
  "technology",
  "society",
  "education",
  "environment",
  "geopolitics",
  "sport",
  "health",
  "science",
  "economy",
  "culture",
  "ethics",
  "ai",
] as const;

export const PRACTICE_WINDOWS = ["morning", "afternoon", "evening", "late_night"] as const;

export const MINUTE_CHOICES = [10, 15, 20, 30, 45, 60] as const;

export const GOAL_LABELS: Record<(typeof GOALS)[number], { label: string; hint: string }> = {
  confidence: { label: "General confidence", hint: "Speak up without my heart racing" },
  interview: { label: "Interviews", hint: "Answer well when it counts" },
  debate: { label: "Debate & MUN", hint: "Argue a case and hold it" },
  academics: { label: "Academics", hint: "Presentations, vivas, seminars" },
  career: { label: "Career", hint: "Meetings, pitches, talking to seniors" },
  everyday: { label: "Everyday", hint: "Small talk, phone calls, saying no" },
};

export const EXPERIENCE_LABELS: Record<(typeof EXPERIENCE)[number], { label: string; hint: string }> = {
  just_starting: { label: "Just starting", hint: "I avoid speaking when I can" },
  some_practice: { label: "Some practice", hint: "I can, but I second-guess myself" },
  comfortable: { label: "Fairly comfortable", hint: "I speak often, I want precision" },
};

export const TOPIC_LABELS: Record<(typeof TOPICS)[number], string> = {
  technology: "Technology",
  society: "Society",
  education: "Education",
  environment: "Climate",
  geopolitics: "World affairs",
  sport: "Sport",
  health: "Health",
  science: "Science",
  economy: "Economy",
  culture: "Culture",
  ethics: "Ethics",
  ai: "AI",
};

export const WINDOW_LABELS: Record<(typeof PRACTICE_WINDOWS)[number], string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  late_night: "Late night",
};

export const onboardingSchema = z.object({
  goals: z
    .array(z.enum(GOALS))
    .min(1, "Pick at least one.")
    .max(3, "Three is plenty — pick the three that matter most."),
  experience: z.enum(EXPERIENCE),
  comfort: z.number().int().min(1).max(5),
  preparingFor: z.string().trim().max(280, "Keep it under 280 characters.").default(""),
  topics: z.array(z.enum(TOPICS)).max(6, "Six topics is enough.").default([]),
  minutesPerDay: z.number().int().min(5).max(120),
  practiceWindow: z.enum(PRACTICE_WINDOWS),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker.")
    .or(z.literal(""))
    .default(""),
});

export type OnboardingAnswers = z.infer<typeof onboardingSchema>;

export const EMPTY_ANSWERS: OnboardingAnswers = {
  goals: [],
  experience: "just_starting",
  comfort: 3,
  preparingFor: "",
  topics: [],
  minutesPerDay: 15,
  practiceWindow: "evening",
  targetDate: "",
};

/** Only what a step needs — used to gate "Continue". */
export function stepIsValid(step: number, answers: OnboardingAnswers): boolean {
  switch (step) {
    case 0:
      return answers.goals.length >= 1 && answers.goals.length <= 3;
    case 1:
      return EXPERIENCE.includes(answers.experience) && answers.comfort >= 1;
    case 2:
      return answers.preparingFor.length <= 280 && answers.topics.length <= 6;
    case 3:
      return (
        answers.minutesPerDay >= 5 &&
        answers.minutesPerDay <= 120 &&
        PRACTICE_WINDOWS.includes(answers.practiceWindow) &&
        (answers.targetDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(answers.targetDate))
      );
    default:
      return true;
  }
}
