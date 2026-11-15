/**
 * Levels.
 *
 * One currency — points — and a ladder with written rungs. A level is not a
 * decoration: it is the answer to "how far have I come, and what is the next
 * thing I can actually do?" So every rung has a sentence about the ability it
 * represents, not a number alone.
 *
 * The thresholds are product decisions, not measurements: 1,000 then 2,500 then
 * 4,000, then +1,500 per level. Changing them changes what every learner sees,
 * so they live in one file with one function reading them.
 *
 * Points are the sum of both worlds' XP. Speaking is speaking — a rep in either
 * world moves the same ladder, and the worlds keep their own ratings separately.
 */

export type LevelStep = {
  level: number;
  name: string;
  /** Total points at which this level begins. */
  at: number;
  /** What you can do at this rung, in one sentence a learner would recognise. */
  blurb: string;
  /** What the next rung will ask of you. */
  unlocks: string;
};

export const LEVELS: readonly LevelStep[] = [
  {
    level: 1,
    name: "First words",
    at: 0,
    blurb: "Your plan is set and your baseline is on record. Everything starts here.",
    unlocks: "A week of reps, so pace and length stop being guesses.",
  },
  {
    level: 2,
    name: "Steady voice",
    at: 1000,
    blurb: "You show up on ordinary days, not just motivated ones.",
    unlocks: "Structure — claim, evidence and impact in that order.",
  },
  {
    level: 3,
    name: "Clear structure",
    at: 2500,
    blurb: "Your answers have a shape a listener can follow without effort.",
    unlocks: "Pressure — answering the objection before it lands.",
  },
  {
    level: 4,
    name: "Under pressure",
    at: 4000,
    blurb: "You handle the counter-argument instead of talking past it.",
    unlocks: "Precision — tighter openings and deliberate endings.",
  },
  {
    level: 5,
    name: "Sharpened",
    at: 5500,
    blurb: "Fewer fillers, cleaner exits, and a voice that holds its register.",
    unlocks: "Persuasion — moving someone who is not on your side.",
  },
  {
    level: 6,
    name: "Persuasive",
    at: 7000,
    blurb: "You change a listener's mind, not just their mood.",
    unlocks: "Consistency at length — three minutes without a stumble.",
  },
  {
    level: 7,
    name: "Arena ready",
    at: 8500,
    blurb: "Scored reps land in the same band every time you try.",
    unlocks: "Harder rooms, and opponents who answer back.",
  },
  {
    level: 8,
    name: "Veteran",
    at: 10000,
    blurb: "Practice is maintenance now; the gains come from harder rooms.",
    unlocks: "nothing above this rung yet — harder rooms are the next design.",
  },
];

export type LevelInfo = {
  level: number;
  name: string;
  blurb: string;
  points: number;
  /** Points at which this level began. */
  floor: number;
  nextAt: number | null;
  nextName: string | null;
  /** Points left to the next rung, or null at the top. */
  toNext: number | null;
  /** 0–100 within the current rung. Exactly 0 for a fresh account. */
  percent: number;
  unlocks: string;
};

export function levelFor(points: number): LevelInfo {
  const total = Math.max(0, Math.round(points));
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (total >= LEVELS[i].at) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const span = next ? next.at - current.at : 0;
  const into = total - current.at;

  return {
    level: current.level,
    name: current.name,
    blurb: current.blurb,
    points: total,
    floor: current.at,
    nextAt: next?.at ?? null,
    nextName: next?.name ?? null,
    toNext: next ? Math.max(0, next.at - total) : null,
    percent: next && span > 0 ? Math.min(100, Math.max(0, Math.round((into / span) * 100))) : 100,
    unlocks: current.unlocks,
  };
}

/** 1,000 → "1,000". Used on both the dashboard and the progress page. */
export function formatPoints(value: number): string {
  return value.toLocaleString("en-IN");
}
