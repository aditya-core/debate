const WORLDS = [
  {
    id: "debate",
    label: "World 01",
    title: "Debate",
    tagline: "Take a side. Defend it.",
    body: "Structured rounds against an opponent that argues back. You learn to build a case, anticipate the counter-case, and stay standing when someone attacks the weakest part of your argument.",
    points: [
      "Opening, rebuttal and closing rounds",
      "Separate rating — never mixed with Extempore",
      "Judged on argument, not volume",
    ],
    from: "var(--c-brand)",
    to: "var(--c-sky)",
    motif: (
      <>
        <rect x="18" y="34" width="88" height="52" rx="12" />
        <rect x="94" y="58" width="72" height="44" rx="11" opacity="0.55" />
        <path d="M36 100v14l18-14" />
        <path d="M110 58v-8" opacity="0.6" />
      </>
    ),
  },
  {
    id: "extempore",
    label: "World 02",
    title: "Extempore",
    tagline: "Think on your feet.",
    body: "A topic you did not choose, a preparation timer you cannot pause, and a speech you have to construct while you are already speaking it. The purest test of thinking out loud.",
    points: [
      "Blind topic draw with a 60-second prep",
      "Filler words, pacing and tone tracked",
      "Structure scored separately from delivery",
    ],
    from: "var(--c-flare)",
    to: "var(--c-sun)",
    motif: (
      <>
        <circle cx="96" cy="72" r="40" />
        <path d="M96 50v22l14 9" />
        <path d="M40 40h26M40 62h18M40 84h22" opacity="0.55" />
      </>
    ),
  },
];

export default function Worlds() {
  return (
    <section id="worlds" className="section relative">
      <div className="shell">
        <div className="max-w-[44rem]">
          <p className="eyebrow reveal">Two worlds, one voice</p>
          <h2 className="reveal mt-5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg">
            More than words. It&rsquo;s what you do with them.
          </h2>
          <p className="reveal mt-5 max-w-[54ch] text-[1rem] leading-[1.7] text-muted">
            Debate and Extempore are trained as separate worlds, with separate
            ratings, because being excellent at prepared argument does not make
            you good at speaking with no notice. One account, two profiles.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {WORLDS.map((w, i) => (
            <article
              key={w.id}
              className="reveal card card-hover spot group overflow-hidden"
              style={{ "--d": `${i * 110}ms` }}
            >
              {/* visual header */}
              <div
                className="relative h-[168px] overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${w.from} 0%, ${w.to} 100%)`,
                }}
              >
                <svg
                  viewBox="0 0 200 140"
                  className="absolute inset-0 h-full w-full"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ opacity: 0.55 }}
                >
                  {w.motif}
                </svg>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.28))]" />

                <div className="absolute inset-x-5 top-5 flex items-center justify-between">
                  <span className="rounded-full bg-white/18 px-2.5 py-1 font-display text-[0.65rem] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    {w.label}
                  </span>
                  <span className="rounded-full border border-white/30 px-2.5 py-1 font-display text-[0.65rem] uppercase tracking-[0.16em] text-white/90">
                    In development
                  </span>
                </div>

                <div className="absolute inset-x-5 bottom-4">
                  <h3 className="font-display text-[1.7rem] font-medium leading-none tracking-tight text-white">
                    {w.title}
                  </h3>
                  <p className="mt-1.5 font-display text-[0.85rem] text-white/85">
                    {w.tagline}
                  </p>
                </div>
              </div>

              {/* body */}
              <div className="p-6 sm:p-7">
                <p className="text-[0.92rem] leading-[1.7] text-muted">{w.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {w.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[0.86rem] text-fg/85">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={w.from}
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
