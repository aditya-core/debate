const CARDS = [
  {
    n: "01",
    title: "Ideas arrive. Words don't.",
    body: "You understand the question. You have the answer. And then you hear yourself saying “um, so, basically…” while the useful sentence stays stuck somewhere behind your eyes.",
    tone: "var(--c-brand)",
    icon: (
      <>
        <path d="M4 6h16M4 12h10M4 18h13" />
      </>
    ),
  },
  {
    n: "02",
    title: "You lose the room, not the argument.",
    body: "Your reasoning was stronger. Their delivery was clearer. That is the whole story of most lost debates, most failed interviews, and most good ideas that quietly died in a meeting.",
    tone: "var(--c-flare)",
    icon: (
      <>
        <path d="M12 3v18M5 10l7-7 7 7" />
      </>
    ),
  },
  {
    n: "03",
    title: "Nobody tells you the truth.",
    body: "Practising alone gives you no signal. A coach gives you a signal once a week, if you can afford one. The thing you actually need is feedback on every single attempt.",
    tone: "var(--c-mint)",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 8v4.5l3 1.8" />
      </>
    ),
  },
];

export default function Problem() {
  return (
    <section className="section relative">
      <div className="shell">
        <div className="max-w-[46rem]">
          <p className="eyebrow reveal">The gap</p>
          <h2 className="reveal mt-5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg">
            Having something to say is not the same as being able to say it.
          </h2>
          <p className="reveal mt-5 max-w-[52ch] text-[1rem] leading-[1.7] text-muted" style={{ "--d": "80ms" }}>
            Communication is the one skill every part of life asks for — and the
            one almost nobody practises deliberately. We built the place to do
            exactly that.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <article
              key={c.n}
              className="reveal card card-hover group relative overflow-hidden p-6 sm:p-7"
              style={{ "--d": `${i * 90}ms` }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{
                    background: `color-mix(in oklab, ${c.tone} 12%, transparent)`,
                    color: c.tone,
                  }}
                >
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {c.icon}
                  </svg>
                </span>
                <span className="font-display text-[0.7rem] tracking-[0.2em] text-faint">
                  {c.n}
                </span>
              </div>

              <h3 className="mt-6 font-display text-[1.15rem] font-medium leading-snug tracking-tight text-fg">
                {c.title}
              </h3>
              <p className="mt-3 text-[0.9rem] leading-[1.7] text-muted">
                {c.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
