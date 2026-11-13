/**
 * The baseline check.
 *
 * One prompt for everybody, deliberately. A baseline is only comparable if the
 * task is the same: if two learners answer different questions, the difference
 * between their first scores belongs to the prompts, not to them. Everything
 * after this is personalised; this one is not, and that is the point.
 */

export const CALIBRATION_PROMPT_ID = "calibration-change-your-mind";

export const CALIBRATION_SECONDS = 60;

export const CALIBRATION_PROMPT = {
  title: "Tell us about a time you changed your mind.",
  brief:
    "What you believed, what moved you, and what you believe now. One minute, out loud, no notes.",
  /** Shown while they speak — three beats are easier to hold than a blank page. */
  beats: ["What you used to think", "What changed it", "What you think now"],
} as const;
