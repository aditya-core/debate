import Link from "next/link";
import PrepTimer from "@/components/practice/PrepTimer";
import { TOPIC_LABELS } from "@/lib/onboarding/schema";
import { prepSeconds, speakSeconds, type Prompt } from "@/lib/practice/prompts";

/**
 * The first-rep page, with every value passed in.
 *
 * Kept separate from the route so the same markup can be rendered without a
 * session — which is how it gets checked against the stylesheet — and so the
 * numbers on it (prep, speak, rhythm) have one owner.
 */
export default function FirstRep({
  firstName,
  accountId,
  prompt,
  reason,
  take,
  goals,
  experience,
  comfort,
  minutesPerDay,
  practiceWindow,
}: {
  firstName: string | null;
  accountId: string;
  prompt: Prompt;
  reason: string;
  take: number;
  goals: string;
  experience: string;
  comfort: number;
  minutesPerDay: number;
  practiceWindow: string;
}) {
  const prep = prepSeconds(prompt.format);
  const speak = speakSeconds(prompt.format);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-canvas">
      {/* One soft wash of colour, top-left, so the page has a light source. */}
      <div
        aria-hidden="true"
        className="welcome-glow pointer-events-none absolute -left-40 -top-48 h-[32rem] w-[32rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--c-brand) 30%, transparent), transparent)",
        }}
      />

      <header className="relative z-10 border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-faint">
            Setup complete
          </p>
          <p className="font-display text-[0.78rem] tracking-[0.03em] text-muted">
            {accountId}
          </p>
        </div>
      </header>

      <main
        id="main"
        className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14"
      >
        <div className="welcome-rise">
          <p className="eyebrow">First rep</p>
          <h1 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-medium leading-[1.06] tracking-[-0.035em] text-fg">
            {firstName ? `${firstName}, you're set.` : "You're set."}
          </h1>
          <p className="mt-3 max-w-[54ch] text-[0.94rem] leading-[1.7] text-muted">
            Setup is done, so here is the first thing we would put in front of you.
            Read it once, then take the {prep} seconds. Nothing is recorded yet — this
            one is only to hear your own voice start.
          </p>
        </div>

        {/* ---------------- the prompt ---------------- */}
        <article
          className="elevated welcome-rise mt-8 overflow-hidden rounded-3xl border border-line bg-surface"
          style={{ animationDelay: "90ms" }}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 sm:px-6">
            <span className="rounded-full border border-brand/35 bg-brand-soft px-2.5 py-1 font-display text-[0.62rem] uppercase tracking-[0.16em] text-fg">
              {prompt.format === "debate" ? "Debate" : "Extempore"}
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 font-display text-[0.62rem] uppercase tracking-[0.16em] text-muted">
              {TOPIC_LABELS[prompt.topic]}
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 font-display text-[0.62rem] uppercase tracking-[0.16em] text-faint">
              {prep}s think · {speak}s speak
            </span>
            {take > 0 ? (
              <span className="ml-auto font-display text-[0.62rem] uppercase tracking-[0.16em] text-faint">
                Take {take + 1}
              </span>
            ) : null}
          </div>

          <div className="px-5 py-6 sm:px-6 sm:py-7">
            <h2 className="font-display text-[clamp(1.35rem,3vw,1.85rem)] font-medium leading-[1.18] tracking-[-0.025em] text-fg">
              {prompt.title}
            </h2>
            <p className="mt-3 max-w-[62ch] text-[0.92rem] leading-[1.75] text-muted">
              {prompt.brief}
            </p>

            <div className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3.5">
              <p className="font-display text-[0.6rem] uppercase tracking-[0.18em] text-faint">
                The hard part
              </p>
              <p className="mt-1.5 max-w-[62ch] text-[0.88rem] leading-relaxed text-fg">
                {prompt.angle}
              </p>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[0.78rem] leading-relaxed text-faint">
              <span aria-hidden="true" className="mt-0.5 text-brand">
                ◆
              </span>
              {reason}
            </p>
          </div>

          <div className="border-t border-line px-5 py-5 sm:px-6">
            <PrepTimer prep={prep} speak={speak} format={prompt.format} />
          </div>
        </article>

        {/* ---------------- exits ---------------- */}
        <div
          className="welcome-rise mt-6 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "180ms" }}
        >
          <Link href={`/welcome?take=${take + 1}`} className="btn btn-outline btn-sm">
            Give me a different one
          </Link>
          <Link href="/account" className="btn btn-primary btn-sm">
            Go to my account
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* ---------------- what it is made of ---------------- */}
        <section
          className="welcome-rise mt-12 border-t border-line pt-8"
          style={{ animationDelay: "260ms" }}
        >
          <h2 className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-faint">
            What this prompt is made of
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Fact label="You're here for" value={goals || "Practice"} />
            <Fact label="Starting point" value={`${experience} · ${comfort}/5`} />
            <Fact
              label="Your rhythm"
              value={`${minutesPerDay} min, ${practiceWindow.toLowerCase()}`}
            />
          </dl>
          <p className="mt-4 max-w-[62ch] text-[0.78rem] leading-relaxed text-faint">
            Prompts come from these answers, not from a generic pile. Change any of
            them later — your account page asks the same questions, and links back
            here.
          </p>
        </section>
      </main>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <dt className="font-display text-[0.58rem] uppercase tracking-[0.18em] text-faint">
        {label}
      </dt>
      <dd className="mt-1.5 text-[0.86rem] leading-snug text-fg">{value}</dd>
    </div>
  );
}
