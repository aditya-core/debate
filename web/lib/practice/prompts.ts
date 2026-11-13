import { GOAL_LABELS, TOPIC_LABELS } from "@/lib/onboarding/schema";

/**
 * The first-prompt library.
 *
 * Hand-written on purpose. A generated prompt would be a promise we cannot keep
 * offline; a curated one is honest about what it is, and it can be tuned by ear
 * — which is the only way a debate prompt gets good. The onboarding answers pick
 * *from* this set, they do not invent from nothing.
 *
 * Every prompt has a shape, because the shape is the lesson:
 *   motion / brief / angle — take a side, say what it is about, then meet the
 *   hardest objection before someone else raises it.
 */

export type PromptFormat = "debate" | "extempore";

export type Prompt = {
  id: string;
  format: PromptFormat;
  topic: keyof typeof TOPIC_LABELS;
  title: string;
  brief: string;
  /** The part that is actually difficult, phrased as coaching, not as a rubric. */
  angle: string;
};

export const PROMPTS: readonly Prompt[] = [
  {
    id: "ai-homework",
    format: "debate",
    topic: "ai",
    title: "Schools should allow AI help on homework, with disclosure",
    brief:
      "Banning a tool every student already has teaches them to hide it. Allowing it, named openly, teaches judgement. Argue for the rule you would actually enforce.",
    angle:
      "The parent on the other side will say you are replacing thinking. Answer that before they do.",
  },
  {
    id: "ai-answers",
    format: "extempore",
    topic: "ai",
    title: "One thing you would refuse to let an AI decide for you",
    brief:
      "Not a category — a specific decision, in your own life, that you would keep in human hands even if the machine were better at it.",
    angle:
      "The hard part is defending the refusal without sounding afraid of progress.",
  },
  {
    id: "phones-class",
    format: "debate",
    topic: "education",
    title: "Phones should be banned in classrooms, not in the corridor",
    brief:
      "The debate is not phones-are-bad. It is where the line belongs, and who enforces it at 9:05 when the bell has already rung.",
    angle:
      "Concede the case for phones — safety calls home — then show why the classroom is still the wrong room.",
  },
  {
    id: "exam-reform",
    format: "extempore",
    topic: "education",
    title: "If you could change one thing about how you were examined, what and why",
    brief:
      "One change, with the trade-off named. Marks are a measuring problem, and every measure leaks.",
    angle:
      "Do not describe a better system. Describe what it would fix, and what it would quietly break.",
  },
  {
    id: "climate-city",
    format: "debate",
    topic: "environment",
    title: "Your city should spend its next big budget on flood defences, not a stadium",
    brief:
      "Two visible futures, one budget. Make the case in money and risk, not in slogans about the planet.",
    angle:
      "Someone will ask what a stadium does for the economy. Have a number-shaped answer ready, and say when it is an estimate.",
  },
  {
    id: "climate-single",
    format: "extempore",
    topic: "environment",
    title: "The one habit you would actually change, and why you have not yet",
    brief:
      "Personal, specific, and honest about the gap between knowing and doing. That gap is the interesting part.",
    angle:
      "Avoid confessions without conclusions, and conclusions without confessions.",
  },
  {
    id: "four-day",
    format: "debate",
    topic: "economy",
    title: "A four-day week raises output, not just morale",
    brief:
      "Take the claim seriously enough to define output. Hours are an input; the argument is about what they produce.",
    angle:
      "The strongest objection is about roles that cannot compress — nursing, teaching, delivery. Answer for them, not for offices.",
  },
  {
    id: "gig-work",
    format: "extempore",
    topic: "economy",
    title: "Is gig work freedom or a pay cut with extra steps?",
    brief:
      "Pick a side and hold it for two minutes, using one concrete example of a person, not a category.",
    angle:
      "Both halves of the question are true for somebody. Your job is to say who and when.",
  },
  {
    id: "caste-sport",
    format: "debate",
    topic: "sport",
    title: "Sporting bodies should be allowed to select teams on merit alone",
    brief:
      "Merit sounds unanswerable until you ask who could afford the coaching. Define merit before you defend it.",
    angle:
      "You will be accused of defending privilege. Distinguish the selection rule from the pipeline that feeds it.",
  },
  {
    id: "sport-mind",
    format: "extempore",
    topic: "sport",
    title: "What losing teaches that winning cannot",
    brief:
      "One specific loss, yours or someone's, and the exact lesson. Not a poster about resilience.",
    angle:
      "The trap is sentimentality. Keep it factual and the feeling arrives on its own.",
  },
  {
    id: "health-screen",
    format: "debate",
    topic: "health",
    title: "Free annual health screening should be mandatory for adults",
    brief:
      "Free removes cost, not reluctance. Argue for the policy and name what you are willing to do about the people who still will not go.",
    angle:
      "Mandatory means an answer for privacy, and for the person who does not want to know.",
  },
  {
    id: "health-talk",
    format: "extempore",
    topic: "health",
    title: "Why it is hard to ask for help, and what made it easier once",
    brief:
      "A precise memory beats a general reflection. One sentence of scene, then the point.",
    angle:
      "Resist the tidy ending. Say what is still difficult.",
  },
  {
    id: "young-vote",
    format: "debate",
    topic: "society",
    title: "The voting age should be lowered to sixteen",
    brief:
      "Sixteen-year-olds pay tax and cannot vote. Make the case in consistency, then deal with the competence objection honestly.",
    angle:
      "The other side will use one example of immaturity. Answer with a principle, not with a better example.",
  },
  {
    id: "city-stranger",
    format: "extempore",
    topic: "society",
    title: "A rule your neighbourhood needs that no law would pass",
    brief:
      "Small, enforceable, and specific to a place you actually know. Name who would resist it.",
    angle:
      "The interesting answer admits it would annoy someone, and says why that is acceptable.",
  },
  {
    id: "alliance",
    format: "debate",
    topic: "geopolitics",
    title: "Small countries gain more from neutrality than from alliances",
    brief:
      "Neutrality is a strategy only if the neighbours accept it. Argue it as a bet, with the failure condition stated.",
    angle:
      "Length of memory matters here: use one historical case, dated, and do not overreach from it.",
  },
  {
    id: "border-tech",
    format: "extempore",
    topic: "geopolitics",
    title: "Technology has made borders harder to defend, not easier",
    brief:
      "Pick the border you mean — goods, people, or information. Each breaks the claim in a different place.",
    angle:
      "Say where your claim is weakest before anyone finds it for you.",
  },
  {
    id: "basic-income",
    format: "debate",
    topic: "economy",
    title: "A universal basic income would make work less meaningful, not more free",
    brief:
      "This is a motion about meaning, so do not hide behind GDP. Define what makes work worth doing.",
    angle:
      "Concede that cash helps. Then explain what cash cannot buy, without romanticising hardship.",
  },
  {
    id: "culture-lang",
    format: "extempore",
    topic: "culture",
    title: "The language you think in, and the one you count in",
    brief:
      "Bilingual people switch for arithmetic, and it means something. Describe the switch, then say what it costs.",
    angle:
      "Stay concrete. One example of a word that does not translate is worth a paragraph of theory.",
  },
  {
    id: "culture-remake",
    format: "debate",
    topic: "culture",
    title: "Remaking old films is a failure of imagination, not a tribute",
    brief:
      "The defence is that stories deserve retelling. The prosecution says the money has stopped moving. Take one side and use one example on each side.",
    angle:
      "Do not sneer at the audience. They are the ones buying the tickets.",
  },
  {
    id: "science-fund",
    format: "debate",
    topic: "science",
    title: "Public money should fund unglamorous science first",
    brief:
      "Maintenance over moonshots. Argue the allocation, and say what you would defund to pay for it.",
    angle:
      "The counterattack is that unglamorous science is where the moonshots come from. Decide whether you agree, and be consistent.",
  },
  {
    id: "science-error",
    format: "extempore",
    topic: "science",
    title: "A time you were confidently wrong, and how you found out",
    brief:
      "The finding-out is the story. Give the moment of evidence, not the moral afterwards.",
    angle:
      "The strongest version admits you were not stupid, just working with what you had.",
  },
  {
    id: "digital-id",
    format: "debate",
    topic: "technology",
    title: "Every citizen should have a digital ID that the state can revoke",
    brief:
      "Convenience on one side, a single switch on the other. Argue the safeguard you would require, then defend why it is enough.",
    angle:
      "The objection is not the ID. It is the revocation. Address the appeal process directly.",
  },
  {
    id: "tech-slow",
    format: "extempore",
    topic: "technology",
    title: "Something you would go back to doing the slow way",
    brief:
      "Not a protest against progress — a preference with reasons. Name what the speed actually cost you.",
    angle:
      "Avoid nostalgia as proof. Say what the slower version gave you that you can measure.",
  },
  {
    id: "media-trust",
    format: "debate",
    topic: "society",
    title: "Readers, not platforms, are responsible for what they believe",
    brief:
      "A motion about responsibility is a motion about power. Decide who had the choice before you assign the blame.",
    angle:
      "You cannot argue this without saying which platform practice you would change. Name one.",
  },
  {
    id: "ethics-lie",
    format: "debate",
    topic: "ethics",
    title: "A kind lie is a debt you hand to someone else",
    brief:
      "Take the motion's side and then, briefly, the honest version of the objection. Two minutes is enough for both if you are precise.",
    angle:
      "Do not retreat into 'it depends'. Choose, then say where the exception lives.",
  },
  {
    id: "ethics-work",
    format: "extempore",
    topic: "ethics",
    title: "The line you would not cross for a promotion",
    brief:
      "One line, stated plainly, and the moment you learned you had it. Specifics make it credible.",
    angle:
      "The trap is a line so noble it costs nothing. Pick one that would actually be tested.",
  },
];

export type PromptChoice = {
  prompt: Prompt;
  /** One sentence, shown to the learner, explaining why this one. */
  reason: string;
};

/** FNV-1a. Deterministic across server and client, no crypto needed. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type PickInput = {
  /** Stable per learner — the display id, so two people get different prompts. */
  accountKey: string;
  topics: readonly string[];
  goals: readonly string[];
  /** Passed in rather than read from the clock, so the pick is testable. */
  day: string;
  /** Changes when the learner asks for another. */
  take?: number;
  /** A world card asked for this format specifically. */
  format?: PromptFormat;
};

export function preferredFormat(goals: readonly string[]): PromptFormat {
  return goals.includes("debate") ? "debate" : "extempore";
}

export function pickPrompt({
  accountKey,
  topics,
  goals,
  day,
  take = 0,
  format: forcedFormat,
}: PickInput): PromptChoice {
  const format = forcedFormat ?? preferredFormat(goals);

  const byTopic = PROMPTS.filter((p) => topics.includes(p.topic));
  const byFormat = PROMPTS.filter((p) => p.format === format);

  // Preference order: their topics *and* the format their goal implies; then
  // their topics whatever the format; then the format; then anything. The
  // reason string has to be true, so it follows whichever pool was used.
  const pools: Array<{ pool: readonly Prompt[]; topicMatch: boolean }> = [
    { pool: byTopic.filter((p) => p.format === format), topicMatch: true },
    { pool: byTopic, topicMatch: true },
    { pool: byFormat, topicMatch: false },
    { pool: PROMPTS, topicMatch: false },
  ];

  const chosen = pools.find((entry) => entry.pool.length > 0) ?? pools[3];
  // `take` is added rather than hashed, so tapping "different one" always moves
  // to the next prompt instead of risking the same card again.
  const index = (hash(`${accountKey}:${day}:${format}`) + take) % chosen.pool.length;
  const prompt = chosen.pool[index];
  const promptTopic = TOPIC_LABELS[prompt.topic];

  const goalLabel = goals.length ? GOAL_LABELS[goals[0] as keyof typeof GOAL_LABELS]?.label : null;

  const reason = chosen.topicMatch
    ? `Because ${promptTopic} was one of your topics${goalLabel ? `, and you're here for ${goalLabel}` : ""}.`
    : goalLabel
      ? `Because you're here for ${goalLabel}, and this is the shortest honest way in.`
      : `Because it is the shortest honest way in.`;

  return { prompt, reason };
}

/**
 * Prep time, in seconds. Extempore convention is one minute of thinking before
 * speaking; debate gets slightly longer because a case needs a shape.
 */
export function prepSeconds(format: PromptFormat): number {
  return format === "debate" ? 90 : 60;
}

/** Speak time — enough to hear yourself, short enough to actually finish. */
export function speakSeconds(format: PromptFormat): number {
  return format === "debate" ? 150 : 120;
}
