import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal & privacy — Gift of Words",
  description:
    "Privacy, terms, cookies, accessibility and security commitments for Gift of Words.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "We collect the minimum needed to run the product: the email address you sign up with, your date of birth (only to determine whether parental consent applies), and the practice sessions you create.",
      "Voice recordings exist to be scored. Raw audio is deleted after the score is produced; the transcript and the feedback are kept so your progress history remains intact. You can export or delete everything from your account.",
      "We do not sell data, and we do not use practice content for advertising.",
    ],
  },
  {
    id: "guardians",
    title: "Parents & guardians",
    body: [
      "If a student is under 18, we require verifiable parental consent before any practice session can be recorded. Consent is recorded with a timestamp and the version of this notice that was shown.",
      "A guardian can request access to, correction of, or deletion of a child's data at any time by writing to hello@giftofwords.app. We respond within 30 days.",
    ],
  },
  {
    id: "terms",
    title: "Terms of service",
    body: [
      "Gift of Words is currently in a pre-release build. Features described on this site are being developed; nothing here is a promise of availability on a particular date.",
      "AI feedback is coaching, not examination. Scores are provided to help you improve and should not be treated as an assessment of your ability by any third party.",
      "Do not use the platform to harass other participants, to record anyone without their consent, or to generate content that is unlawful.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "The marketing site sets no advertising cookies and runs no third-party trackers. Your theme preference is stored locally in your browser, not on our servers.",
      "Once accounts exist, authentication requires a strictly necessary session cookie. That cookie is not used for tracking.",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    body: [
      "We target WCAG 2.2 AA. Text meets minimum contrast in both light and dark themes, every interactive control is reachable by keyboard, focus is always visible, and all motion respects the reduced-motion setting of your device.",
      "If something is unusable for you, tell us and treat it as a bug report — not a feature request.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "Access is authorised on the server for every request — never on the client. Identifiers are not credentials, and no request is trusted because it carries an ID.",
      "If you believe you have found a vulnerability, write to hello@giftofwords.app with enough detail to reproduce it. We will acknowledge within 72 hours.",
    ],
  },
];

export default function LegalPage() {
  return (
    <div className="shell max-w-[880px] py-14 sm:py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-5 font-display text-[clamp(2rem,4.6vw,3rem)] font-medium leading-[1.04] tracking-[-0.035em] text-fg">
        The plain-language version.
      </h1>
      <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-[1.7] text-muted">
        Written to be read. This is a draft that takes effect when the first
        cohort opens; the final version will be reviewed before any real user
        data is processed.
      </p>

      <div className="mt-8 rounded-xl border border-line bg-surface-2 p-4 text-[0.82rem] leading-relaxed text-muted">
        <strong className="font-medium text-fg">Draft v0.1 · 9 November 2026.</strong>{" "}
        This page is a commitment, not yet a legal instrument. Questions:
        hello@giftofwords.app.
      </div>

      <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-line px-3 py-1.5 font-display text-[0.78rem] text-muted transition-colors hover:border-fg hover:text-fg"
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-12">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="font-display text-[1.35rem] font-medium tracking-tight text-fg">
              {s.title}
            </h2>
            <div className="mt-3 space-y-3">
              {s.body.map((p) => (
                <p key={p.slice(0, 24)} className="max-w-[68ch] text-[0.92rem] leading-[1.75] text-muted">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-line pt-6">
        <Link href="/" className="btn btn-outline">
          Back to the beginning
        </Link>
      </div>
    </div>
  );
}
