const STEPS = [
  {
    n: "1",
    title: "Speak before you feel ready",
    body: "Draw a topic or take a side. A timer starts. No re-recording, no re-reading the question, no safety net — because that is what a real room feels like.",
    tone: "var(--c-brand)",
  },
  {
    n: "2",
    title: "Get scored on substance",
    body: "Every attempt is judged against a fixed rubric: thesis, evidence, structure, rebuttal, delivery. Fixed rubrics mean the number actually moves when you improve.",
    tone: "var(--c-sky)",
  },
  {
    n: "3",
    title: "Fix one thing at a time",
    body: "The weakness engine tracks the same failure across sessions and drills it. You are not given a random exercise — you are given the one that addresses what you keep getting wrong.",
    tone: "var(--c-flare)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section relative border-y border-line bg-surface-2">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[42rem]">
            <p className="eyebrow reveal">How it works</p>
            <h2 className="reveal mt-5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg">
              Three steps. Repeatedly, honestly.
            </h2>
          </div>
          <p className="reveal max-w-[30ch] text-[0.9rem] leading-relaxed text-muted">
            The loop is deliberately small. Small loops get repeated; big
            programmes get abandoned in week two.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="reveal card relative p-6 sm:p-7"
              style={{ "--d": `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full font-display text-[0.85rem] font-semibold text-white"
                  style={{ background: s.tone }}
                >
                  {s.n}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-px flex-1 md:block"
                    style={{
                      background:
                        "linear-gradient(90deg, color-mix(in oklab, var(--c-fg) 18%, transparent), transparent)",
                    }}
                  />
                )}
              </div>
              <h3 className="mt-5 font-display text-[1.1rem] font-medium tracking-tight text-fg">
                {s.title}
              </h3>
              <p className="mt-2.5 text-[0.9rem] leading-[1.7] text-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
