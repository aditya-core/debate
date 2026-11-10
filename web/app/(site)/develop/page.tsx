import type { Metadata } from "next";
import Link from "next/link";
import Radar from "@/components/charts/Radar";
import { ROADMAP, SKILLS } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Building in public — Gift of Words",
  description:
    "What is shipped, what is being built, and exactly what Gift of Words measures.",
};

const STATUS: Record<string, { label: string; tone: string; bg: string }> = {
  shipped: { label: "Shipped", tone: "var(--c-mint-text)", bg: "rgba(0,185,138,0.12)" },
  building: { label: "Building", tone: "var(--c-sun-text)", bg: "rgba(245,163,0,0.14)" },
  next: { label: "Next", tone: "var(--c-faint)", bg: "transparent" },
};

const CHANGELOG = [
  {
    date: "9 Nov 2026",
    title: "Landing page and design system",
    body: "Two complete themes, a page built around evidence rather than adjectives, and a live demo of the practice loop.",
    tag: "Shipped",
  },
  {
    date: "9 Nov 2026",
    title: "Architecture and capacity plan",
    body: "Stack locked, free-tier budgets modelled for the first 100 users, and the four launch conditions written down before any code.",
    tag: "Shipped",
  },
  {
    date: "7 Nov 2026",
    title: "Identity model agreed",
    body: "One account, two permanent sub-identities for Debate and Extempore, plus a shared layer that reads across both without merging scores.",
    tag: "Shipped",
  },
];

export default function DevelopPage() {
  const shipped = ROADMAP.filter((r) => r.status === "shipped").length;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 grid-bg" />
          <div
            className="orb"
            style={{
              width: 460,
              height: 460,
              top: -180,
              right: -100,
              background:
                "radial-gradient(circle, var(--c-sky) 0%, transparent 70%)",
              opacity: 0.16,
            }}
          />
        </div>

        <div className="shell py-16 sm:py-20">
          <p className="eyebrow reveal">Building in public</p>
          <h1 className="reveal mt-5 max-w-[20ch] font-display text-[clamp(2.2rem,5.4vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.035em] text-fg">
            You can watch this get built.
          </h1>
          <p className="reveal mt-5 max-w-[56ch] text-[1rem] leading-[1.7] text-muted">
            Most products appear finished and then ask for your trust. This one
            is being built in the open, stage by stage, with the decisions
            written down. Here is exactly where it stands.
          </p>

          <dl className="reveal mt-10 grid max-w-[36rem] grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              { k: `${shipped}/${ROADMAP.length}`, v: "stages shipped" },
              { k: "2", v: "practice worlds" },
              { k: "6", v: "skills measured" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-2xl font-medium tracking-tight text-fg">
                  {s.k}
                </dt>
                <dd className="mt-1 text-[0.72rem] uppercase tracking-[0.14em] text-faint">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* roadmap */}
      <section className="section">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium tracking-[-0.03em] text-fg">
              The build, in eight stages
            </h2>
            <p className="text-[0.82rem] text-faint">Last updated 9 Nov 2026</p>
          </div>

          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {ROADMAP.map((r, i) => {
              const s = STATUS[r.status] ?? STATUS.next;
              const isActive = r.status === "building";
              return (
                <li
                  key={r.title}
                  className="reveal card relative p-5 sm:p-6"
                  style={{ "--d": `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-display text-[0.7rem] uppercase tracking-[0.18em]"
                        style={{ color: isActive ? s.tone : "var(--c-faint)" }}
                      >
                        {r.stage}
                      </span>
                    </div>
                    <span
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[0.65rem] uppercase tracking-[0.14em]"
                      style={{ color: s.tone, background: s.bg }}
                    >
                      {isActive && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: s.tone }}
                        />
                      )}
                      {s.label}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-[1.05rem] font-medium tracking-tight text-fg">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-[0.87rem] leading-relaxed text-muted">
                    {r.detail}
                  </p>

                  <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:
                          r.status === "shipped"
                            ? "100%"
                            : r.status === "building"
                              ? "55%"
                              : "0%",
                        background: isActive
                          ? "linear-gradient(90deg, var(--c-sun), var(--c-flare))"
                          : "var(--c-mint)",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* what we measure */}
      <section className="section border-y border-line bg-surface-2">
        <div className="shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal card p-6">
            <h2 className="font-display text-[1.1rem] font-medium tracking-tight text-fg">
              What we measure
            </h2>
            <p className="mt-1.5 text-[0.84rem] text-faint">
              Six dimensions · same rubric every session
            </p>
            <div className="mx-auto mt-4 max-w-[320px]">
              <Radar data={SKILLS} id="develop" />
            </div>
          </div>

          <div>
            <p className="eyebrow reveal">Method</p>
            <h2 className="reveal mt-4 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-medium leading-tight tracking-[-0.03em] text-fg">
              The rubric is public because the score should be arguable.
            </h2>
            <p className="reveal mt-4 max-w-[52ch] text-[0.95rem] leading-[1.7] text-muted">
              If a system can tell you that you scored 64 on rebuttal, it should
              be able to tell you why — and you should be able to disagree with
              it. Every dimension below is scored against fixed criteria, and
              every score keeps the rubric version it was measured with.
            </p>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {SKILLS.map((s) => (
                <li key={s.label} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>
                    <span className="block font-display text-[0.86rem] text-fg">
                      {s.label}
                    </span>
                    <span className="text-[0.78rem] text-faint">{s.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* changelog */}
      <section className="section">
        <div className="shell">
          <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium tracking-[-0.03em] text-fg">
            Changelog
          </h2>

          <ul className="mt-8 divide-y divide-line border-y border-line">
            {CHANGELOG.map((c) => (
              <li key={c.title} className="reveal flex flex-col gap-2 py-6 sm:flex-row sm:gap-8">
                <span className="w-[7.5rem] shrink-0 font-display text-[0.78rem] uppercase tracking-[0.12em] text-faint">
                  {c.date}
                </span>
                <div>
                  <h3 className="font-display text-[1rem] font-medium text-fg">
                    {c.title}
                  </h3>
                  <p className="mt-1 max-w-[60ch] text-[0.88rem] leading-relaxed text-muted">
                    {c.body}
                  </p>
                </div>
                <span className="h-fit shrink-0 rounded-full bg-mint/12 px-2.5 py-1 font-display text-[0.65rem] uppercase tracking-[0.14em] text-mint-text sm:ml-auto">
                  {c.tag}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn btn-primary">
              Join the first cohort <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/" className="btn btn-outline">
              Back to the beginning
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
