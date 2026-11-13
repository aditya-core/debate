"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import SpeechCapture from "@/components/practice/SpeechCapture";
import {
  CALIBRATION_PROMPT,
  CALIBRATION_PROMPT_ID,
  CALIBRATION_SECONDS,
} from "@/lib/practice/calibration";
import {
  EMPTY_ANSWERS,
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  GOALS,
  MINUTE_CHOICES,
  type OnboardingAnswers,
  PRACTICE_WINDOWS,
  stepIsValid,
  TOPIC_LABELS,
  TOPICS,
  WINDOW_LABELS,
  EXPERIENCE,
  GOALS as GOAL_KEYS,
} from "@/lib/onboarding/schema";

const STEPS = [
  { title: "What are you here for?", note: "Pick up to three." },
  { title: "Where are you starting from?", note: "Be honest — it changes what we give you." },
  { title: "What should we put in front of you?", note: "Optional, but it makes practice feel like yours." },
  { title: "How much time will you give this?", note: "A promise you can keep beats one you can't." },
  {
    title: "One optional minute",
    note: "A spoken baseline — the only question everyone answers, so day one has a starting line. Skip it if you'd rather.",
  },
  { title: "One last look", note: "You can change any of this later." },
] as const;

const TOTAL = STEPS.length;

const INIT = { status: "idle" as const };

/** 1 = I freeze, 5 = confident. */
const COMFORT_LABELS = [
  "I freeze",
  "Very nervous",
  "It depends",
  "Mostly fine",
  "Confident",
] as const;

export default function Wizard({
  initial,
  firstName,
  accountId,
  mode,
}: {
  initial?: Partial<OnboardingAnswers>;
  firstName: string | null;
  accountId: string;
  mode: "onboarding" | "edit";
}) {
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    ...EMPTY_ANSWERS,
    ...initial,
  });
  const [step, setStep] = useState(0);
  // The baseline lives above the capture card so it survives moving to review.
  const [transcript, setTranscript] = useState("");
  const [captureMs, setCaptureMs] = useState(0);
  const [state, formAction, pending] = useActionState(completeOnboardingAction, INIT);

  const canContinue = stepIsValid(step, answers);
  const isLast = step === TOTAL - 1;

  function update<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGoal(goal: OnboardingAnswers["goals"][number]) {
    setAnswers((prev) => {
      if (prev.goals.includes(goal)) {
        return { ...prev, goals: prev.goals.filter((g) => g !== goal) };
      }
      if (prev.goals.length >= 3) return prev;
      return { ...prev, goals: [...prev.goals, goal] };
    });
  }

  function toggleTopic(topic: OnboardingAnswers["topics"][number]) {
    setAnswers((prev) => {
      if (prev.topics.includes(topic)) {
        return { ...prev, topics: prev.topics.filter((t) => t !== topic) };
      }
      if (prev.topics.length >= 6) return prev;
      return { ...prev, topics: [...prev.topics, topic] };
    });
  }

  return (
    <div className="min-h-[100svh] bg-canvas">
      {/* ---- head: who you are, and how far along ---- */}
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-faint">
              {mode === "edit" ? "Editing your setup" : "Setting up"}
            </p>
            <p className="mt-0.5 truncate font-display text-[0.82rem] tracking-[0.03em] text-fg">
              {accountId}
            </p>
          </div>
          <p className="shrink-0 font-display text-[0.72rem] tabular-nums tracking-[0.08em] text-muted">
            {step + 1}
            <span className="text-faint"> / {TOTAL}</span>
          </p>
        </div>
        <div
          className="h-[2px] w-full bg-line"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
          aria-label="Setup progress"
        >
          <div
            className="h-full bg-linear-to-r from-brand via-sky to-flare transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        {state.status === "error" && state.message ? (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-flare/35 bg-flare-soft px-4 py-3 text-[0.86rem] leading-relaxed text-fg"
          >
            {state.message}
          </div>
        ) : null}

        <h1 className="font-display text-[clamp(1.6rem,3.6vw,2.3rem)] font-medium leading-tight tracking-[-0.03em] text-fg">
          {step === 0 && firstName ? `First, ${firstName} — ` : ""}
          {STEPS[step].title}
        </h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{STEPS[step].note}</p>

        <form action={formAction} className="mt-8">
          <input type="hidden" name="answers" value={JSON.stringify(answers)} />
          <input type="hidden" name="transcript" value={transcript} />
          <input type="hidden" name="durationMs" value={captureMs} />
          <input type="hidden" name="captureSource" value={captureMs > 0 ? "speech" : "typed"} />
          <input type="hidden" name="promptId" value={CALIBRATION_PROMPT_ID} />

          {/* ---------------- step 1: goals ---------------- */}
          {step === 0 ? (
            <fieldset>
              <legend className="sr-only">What are you here for?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOAL_KEYS.map((goal) => {
                  const active = answers.goals.includes(goal);
                  const atLimit = answers.goals.length >= 3 && !active;
                  return (
                    <button
                      key={goal}
                      type="button"
                      aria-pressed={active}
                      disabled={atLimit}
                      onClick={() => toggleGoal(goal)}
                      className={[
                        "group rounded-2xl border p-4 text-left transition-all duration-200",
                        active
                          ? "border-brand bg-brand-soft shadow-[0_0_0_1px_var(--c-brand)]"
                          : "border-line bg-surface hover:border-line-strong hover:-translate-y-0.5",
                        atLimit ? "cursor-not-allowed opacity-40 hover:translate-y-0" : "",
                      ].join(" ")}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-display text-[0.95rem] font-medium text-fg">
                            {GOAL_LABELS[goal].label}
                          </span>
                          <span className="mt-1 block text-[0.8rem] leading-relaxed text-muted">
                            {GOAL_LABELS[goal].hint}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={[
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[0.65rem]",
                            active
                              ? "border-brand bg-brand text-white"
                              : "border-line-strong text-transparent",
                          ].join(" ")}
                        >
                          ✓
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {/* ---------------- step 2: experience + comfort ---------------- */}
          {step === 1 ? (
            <div className="space-y-8">
              <fieldset>
                <legend className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-faint">
                  Right now
                </legend>
                <div className="mt-3 grid gap-2.5">
                  {EXPERIENCE.map((level) => {
                    const active = answers.experience === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("experience", level)}
                        className={[
                          "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          active
                            ? "border-brand bg-brand-soft"
                            : "border-line bg-surface hover:border-line-strong",
                        ].join(" ")}
                      >
                        <span
                          aria-hidden="true"
                          className={[
                            "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                            active ? "border-brand" : "border-line-strong",
                          ].join(" ")}
                        >
                          {active ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
                        </span>
                        <span>
                          <span className="block font-display text-[0.9rem] font-medium text-fg">
                            {EXPERIENCE_LABELS[level].label}
                          </span>
                          <span className="block text-[0.78rem] text-muted">
                            {EXPERIENCE_LABELS[level].hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-faint">
                  Speaking in front of people, I am…
                </legend>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {COMFORT_LABELS.map((label, i) => {
                    const value = i + 1;
                    const active = answers.comfort === value;
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("comfort", value)}
                        className={[
                          "rounded-xl border px-1 py-3 text-center transition-colors",
                          active
                            ? "border-brand bg-brand-soft"
                            : "border-line bg-surface hover:border-line-strong",
                        ].join(" ")}
                      >
                        <span className="block font-display text-[1rem] tabular-nums text-fg">
                          {value}
                        </span>
                        <span className="mt-1 block text-[0.62rem] leading-tight text-muted">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          ) : null}

          {/* ---------------- step 3: context + topics ---------------- */}
          {step === 2 ? (
            <div className="space-y-8">
              <div>
                <label
                  htmlFor="preparingFor"
                  className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-faint"
                >
                  Anything coming up? <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  id="preparingFor"
                  name="preparingFor"
                  rows={3}
                  maxLength={280}
                  value={answers.preparingFor}
                  onChange={(e) => update("preparingFor", e.target.value)}
                  placeholder="A college interview in March. School debate finals. Speaking up in class without going red."
                  className="mt-2 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[0.9rem] leading-relaxed text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12"
                />
                <p className="mt-1.5 text-right text-[0.72rem] tabular-nums text-faint">
                  {answers.preparingFor.length} / 280
                </p>
              </div>

              <fieldset>
                <legend className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-faint">
                  Topics you'd actually enjoy
                </legend>
                <p className="mt-1.5 text-[0.8rem] text-muted">
                  Up to six. This is how prompts stop being generic.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TOPICS.map((topic) => {
                    const active = answers.topics.includes(topic);
                    const atLimit = answers.topics.length >= 6 && !active;
                    return (
                      <button
                        key={topic}
                        type="button"
                        aria-pressed={active}
                        disabled={atLimit}
                        onClick={() => toggleTopic(topic)}
                        className={[
                          "rounded-full border px-3.5 py-1.5 font-display text-[0.78rem] transition-colors",
                          active
                            ? "border-brand bg-brand text-white"
                            : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg",
                          atLimit ? "cursor-not-allowed opacity-40" : "",
                        ].join(" ")}
                      >
                        {TOPIC_LABELS[topic]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          ) : null}

          {/* ---------------- step 4: rhythm ---------------- */}
          {step === 3 ? (
            <div className="space-y-8">
              <fieldset>
                <legend className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-faint">
                  Minutes a day
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {MINUTE_CHOICES.map((minutes) => {
                    const active = answers.minutesPerDay === minutes;
                    return (
                      <button
                        key={minutes}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("minutesPerDay", minutes)}
                        className={[
                          "rounded-xl border py-3 font-display text-[0.95rem] tabular-nums transition-colors",
                          active
                            ? "border-brand bg-brand-soft text-fg"
                            : "border-line bg-surface text-muted hover:border-line-strong",
                        ].join(" ")}
                      >
                        {minutes}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-faint">
                  Usually free
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRACTICE_WINDOWS.map((window) => {
                    const active = answers.practiceWindow === window;
                    return (
                      <button
                        key={window}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("practiceWindow", window)}
                        className={[
                          "rounded-xl border py-2.5 font-display text-[0.8rem] transition-colors",
                          active
                            ? "border-brand bg-brand-soft text-fg"
                            : "border-line bg-surface text-muted hover:border-line-strong",
                        ].join(" ")}
                      >
                        {WINDOW_LABELS[window]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="targetDate"
                  className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-faint"
                >
                  Is there a date? <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={answers.targetDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => update("targetDate", e.target.value)}
                  className="mt-2 w-full max-w-[16rem] rounded-xl border border-line bg-surface px-4 py-2.5 text-[0.9rem] text-fg outline-none transition-colors focus:border-brand focus:ring-4 focus:ring-brand/12"
                />
              </div>
            </div>
          ) : null}

          {/* ---------------- step 5: the optional baseline ---------------- */}
          {step === 4 ? (
            <div className="space-y-4">
              <SpeechCapture
                promptTitle={CALIBRATION_PROMPT.title}
                beats={CALIBRATION_PROMPT.beats}
                seconds={CALIBRATION_SECONDS}
                text={transcript}
                onText={setTranscript}
                onDuration={(ms) => setCaptureMs((prev) => Math.max(prev, ms))}
              />

              <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.78rem] leading-relaxed text-muted">
                This is the one question every learner answers, which is what makes
                it a baseline rather than a test. The words are stored as text for
                seven days, then deleted; audio never leaves your device.{" "}
                <span className="text-fg">
                  Press Continue with the box empty to skip — nothing is locked.
                </span>
              </p>
            </div>
          ) : null}

          {/* ---------------- step 6: review ---------------- */}
          {step === 5 ? (
            <div className="space-y-5">
              <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
                <Row label="Here for" value={answers.goals.map((g) => GOAL_LABELS[g].label).join(", ")} />
                <Row
                  label="Starting point"
                  value={`${EXPERIENCE_LABELS[answers.experience].label} · confidence ${answers.comfort}/5`}
                />
                <Row
                  label="Working towards"
                  value={answers.preparingFor.trim() || "Nothing specific yet"}
                />
                <Row
                  label="Topics"
                  value={
                    answers.topics.length
                      ? answers.topics.map((t) => TOPIC_LABELS[t]).join(", ")
                      : "We'll choose for you"
                  }
                />
                <Row
                  label="Rhythm"
                  value={`${answers.minutesPerDay} min a day, ${WINDOW_LABELS[
                    answers.practiceWindow
                  ].toLowerCase()}${answers.targetDate ? ` · by ${answers.targetDate}` : ""}`}
                />
                <Row
                  label="Baseline"
                  value={
                    transcript.trim()
                      ? `${transcript.trim().split(/\s+/).length} words recorded`
                      : "Skipped — you can add it later"
                  }
                />
                <Row label="Account" value={accountId} mono />
              </dl>

              <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.8rem] leading-relaxed text-muted">
                This is stored against your account and used to choose prompts and
                feedback for you. Nothing here is shown to other learners. You can
                change it any time from your account page.
              </p>
            </div>
          ) : null}

          {/* ---------------- nav ---------------- */}
          <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || pending}
              className="btn btn-outline btn-sm disabled:opacity-40"
            >
              Back
            </button>

            {isLast ? (
              <button
                type="submit"
                disabled={pending}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Finish setup"}
                {!pending && <span aria-hidden="true">↗</span>}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => canContinue && setStep((s) => Math.min(TOTAL - 1, s + 1))}
                disabled={!canContinue}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-45"
              >
                Continue
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </form>

        <p className="mt-8 text-center text-[0.74rem] leading-relaxed text-faint">
          This step is required before the arenas open.
        </p>
      </main>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
      <dt className="font-display text-[0.64rem] uppercase tracking-[0.16em] text-faint">{label}</dt>
      <dd
        className={[
          "max-w-[70%] text-right text-[0.86rem] leading-snug text-fg",
          mono ? "font-display tracking-[0.04em]" : "",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}
