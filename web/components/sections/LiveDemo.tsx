"use client";

import { useEffect, useState } from "react";

const PHASES = ["speak", "score", "feedback"] as const;
type Phase = (typeof PHASES)[number];

const SCORES = [
  { label: "Structure", value: 88, tone: "var(--c-brand)" },
  { label: "Argument", value: 82, tone: "var(--c-sky)" },
  { label: "Clarity", value: 76, tone: "var(--c-mint)" },
  { label: "Delivery", value: 71, tone: "var(--c-sun)" },
];

/**
 * A three-beat demo of an actual practice loop: speak → score → feedback.
 * Illustrative, and labelled as such. It rotates on its own so the page
 * feels inhabited rather than printed.
 */
export default function LiveDemo() {
  const [phase, setPhase] = useState<Phase>("speak");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setPhase("feedback");
      return;
    }
    const id = window.setInterval(() => {
      setPhase((p) => PHASES[(PHASES.indexOf(p) + 1) % PHASES.length]);
    }, 4600);
    return () => window.clearInterval(id);
  }, []);

  const step = PHASES.indexOf(phase);

  return (
    <div className="card relative w-full overflow-hidden p-5 sm:p-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pill-dot" />
          <span className="font-display text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">
            Extempore · live
          </span>
        </div>
        <span className="tnum rounded-full bg-surface-2 px-2.5 py-1 font-display text-[0.72rem] text-muted">
          {phase === "speak" ? "01:24" : "01:46"}
        </span>
      </div>

      {/* step indicator */}
      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {PHASES.map((p, i) => (
          <span
            key={p}
            className="h-1 flex-1 overflow-hidden rounded-full bg-line"
          >
            <span
              className="block h-full rounded-full transition-all duration-700"
              style={{
                width: i < step ? "100%" : i === step ? "100%" : "0%",
                background:
                  i <= step
                    ? "linear-gradient(90deg, var(--c-brand), var(--c-sky))"
                    : "transparent",
              }}
            />
          </span>
        ))}
      </div>

      {/* panel */}
      <div key={phase} className="demo-panel mt-5 min-h-[212px]">
        {phase === "speak" && <Speak />}
        {phase === "score" && <Score />}
        {phase === "feedback" && <Feedback />}
      </div>

      <p className="mt-4 border-t border-line pt-3 text-[0.68rem] leading-relaxed text-faint">
        Illustrative interface — not a live session.
        {reduced ? " Motion reduced for your device." : ""}
      </p>
    </div>
  );
}

function Speak() {
  return (
    <div>
      <p className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-faint">
        Your prompt
      </p>
      <p className="mt-2 font-display text-lg leading-snug text-fg">
        “Is convenience quietly making us less capable?”
      </p>

      <div className="mt-6 flex h-16 items-center justify-center gap-[3px]">
        {Array.from({ length: 38 }).map((_, i) => (
          <span
            key={i}
            className="eq-bar w-[3px] rounded-full"
            style={{
              height: `${28 + Math.abs(Math.sin(i * 1.7)) * 34}px`,
              animationDelay: `${(i % 9) * 0.09}s`,
              background:
                i % 3 === 0
                  ? "var(--c-brand)"
                  : i % 3 === 1
                    ? "var(--c-sky)"
                    : "var(--c-mint)",
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-[0.8rem] text-muted">
        Listening… speak for 90 seconds
      </p>
    </div>
  );
}

function Score() {
  return (
    <div>
      <p className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-faint">
        Scoring against the rubric
      </p>

      <div className="mt-5 space-y-3.5">
        {SCORES.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-[0.82rem] text-muted">{s.label}</span>
              <span className="tnum font-display text-[0.82rem] font-medium text-fg">
                {s.value}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${s.value}%`,
                  background: s.tone,
                  animation: `bar-grow 1s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms both`,
                  transformOrigin: "left",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes bar-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}

function Feedback() {
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-faint">
            Overall
          </p>
          <p className="mt-1 font-display text-[2.6rem] font-medium leading-none tracking-tight text-fg">
            82<span className="text-lg text-faint">/100</span>
          </p>
        </div>
        <span className="rounded-full bg-mint/12 px-2.5 py-1 font-display text-[0.72rem] text-mint-text">
          +34 this week
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-line bg-surface-2 p-3.5">
        <p className="font-display text-[0.7rem] uppercase tracking-[0.18em] text-brand">
          The one thing to fix
        </p>
        <p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted">
          You answered the counter-argument with a <em>new</em> claim instead of
          addressing theirs. Next round: restate their point in one sentence
          before you reply.
        </p>
      </div>
    </div>
  );
}
