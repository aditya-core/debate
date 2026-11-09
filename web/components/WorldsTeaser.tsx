const WORLDS = [
  {
    id: "debate",
    index: "01",
    title: "Debate World",
    tagline: "Take a side. Defend it.",
    body: "Structured rounds against an AI opponent that argues back. Claims, evidence, rebuttals and the discipline of holding a position under pressure.",
    accent: "from-brand/70 to-sky/60",
  },
  {
    id: "extempore",
    index: "02",
    title: "Extempore World",
    tagline: "Think on your feet.",
    body: "A topic you did not choose, a timer you cannot pause, and a speech you have to build as you speak it. Structure born under pressure.",
    accent: "from-sky/60 to-aqua/60",
  },
];

export default function WorldsTeaser() {
  return (
    <section
      id="explore"
      className="relative border-t border-paper/[0.06] bg-ink px-6 py-24 sm:px-8 lg:px-14 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px]">
        <p className="eyebrow flex items-center gap-3">
          <span className="inline-block h-[1px] w-8 bg-aqua/60" />
          Two worlds, one voice
        </p>

        <h2 className="mt-6 max-w-[22ch] font-display text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.03em] text-paper">
          More than words.
          <br />
          <span className="text-paper/45">It&rsquo;s what you do with them.</span>
        </h2>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {WORLDS.map((world) => (
            <article key={world.id} className="world-card group p-7 sm:p-9">
              <div className="flex items-start justify-between">
                <span className="font-display text-[0.7rem] uppercase tracking-[0.3em] text-paper/45">
                  {world.index}
                </span>
                <span
                  className={`h-[1.5px] w-10 bg-linear-to-r ${world.accent} transition-all duration-700 group-hover:w-16`}
                />
              </div>

              <h3 className="mt-10 font-display text-2xl font-medium tracking-tight text-paper sm:text-[1.75rem]">
                {world.title}
              </h3>
              <p className="mt-2 font-display text-sm text-aqua/70">
                {world.tagline}
              </p>
              <p className="mt-5 max-w-[42ch] text-[0.9rem] leading-[1.7] text-paper/55">
                {world.body}
              </p>

              <div className="mt-8 flex items-center gap-2 font-display text-[0.65rem] uppercase tracking-[0.28em] text-paper/50">
                <span className="h-1 w-1 rounded-full bg-aqua/60" />
                In development
              </div>
            </article>
          ))}
        </div>

        <div
          id="vision"
          className="mt-20 max-w-[62ch] border-l border-paper/10 pl-6 sm:pl-8"
        >
          <p className="font-display text-[clamp(1.15rem,2vw,1.5rem)] leading-[1.45] text-paper/70">
            The ability to think clearly and say it well is not a talent
            you&rsquo;re born with.
            <span className="text-paper"> It is a skill you train</span> — in
            rounds, under timers, with honest feedback, again and again.
          </p>
        </div>
      </div>
    </section>
  );
}
