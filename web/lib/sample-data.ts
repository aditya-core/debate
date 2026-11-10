/**
 * Illustrative data for the marketing surfaces.
 *
 * This is NOT user data and never will be — it exists so the landing page can
 * show what the product measures. Every place it is rendered says so in the UI.
 * When the real dashboard exists, these constants are replaced by API values.
 */

export type SkillAxis = { label: string; value: number; note: string };

export const SKILLS: SkillAxis[] = [
  { label: "Argument", value: 82, note: "Claim supported by evidence" },
  { label: "Structure", value: 88, note: "Signposted, logical flow" },
  { label: "Clarity", value: 76, note: "One idea per sentence" },
  { label: "Delivery", value: 71, note: "Pace, pauses, emphasis" },
  { label: "Rebuttal", value: 64, note: "Engaging the other side" },
  { label: "Listening", value: 79, note: "Responding to what was said" },
];

export const WEEKLY_MINUTES = [
  { day: "M", minutes: 32 },
  { day: "T", minutes: 48 },
  { day: "W", minutes: 25 },
  { day: "T", minutes: 61 },
  { day: "F", minutes: 44 },
  { day: "S", minutes: 72 },
  { day: "S", minutes: 55 },
];

/** Rating across eight weeks — a plausible beginner arc. */
export const RATING_SERIES = [1180, 1204, 1197, 1238, 1261, 1255, 1290, 1312];

export const RUBRIC = [
  { label: "Thesis stated in the first 20 seconds", score: 9, max: 10 },
  { label: "Evidence directly supports the claim", score: 7, max: 10 },
  { label: "Engaged the strongest opposing argument", score: 6, max: 10 },
  { label: "Rebuttal answered the actual point", score: 8, max: 10 },
  { label: "Conclusion returned to the thesis", score: 9, max: 10 },
];

export const ROADMAP = [
  {
    stage: "Stage 1",
    title: "Product blueprint",
    detail: "Identity model, two worlds, data ownership, journeys.",
    status: "shipped",
  },
  {
    stage: "Stage 2",
    title: "Design system",
    detail: "Colour, type, spacing, components, motion principles.",
    status: "shipped",
  },
  {
    stage: "Stage 3",
    title: "Landing page",
    detail: "The public experience you are looking at right now.",
    status: "shipped",
  },
  {
    stage: "Stage 4",
    title: "Identity & auth",
    detail: "One account, two sub-profiles, parental consent for under-18s.",
    status: "building",
  },
  {
    stage: "Stage 5",
    title: "Onboarding & baseline",
    detail: "Five-minute assessment that seeds the first skill profile.",
    status: "next",
  },
  {
    stage: "Stage 6",
    title: "Debate & Extempore dashboards",
    detail: "Two independent worlds with separate ratings and histories.",
    status: "next",
  },
  {
    stage: "Stage 7",
    title: "AI practice & intelligence",
    detail: "Live rounds, structured feedback, cross-world weakness engine.",
    status: "next",
  },
  {
    stage: "Stage 8",
    title: "Testing & launch",
    detail: "Security, accessibility, performance, first cohort.",
    status: "next",
  },
] as const;
