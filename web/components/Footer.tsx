import Link from "next/link";
import { Mark } from "./Nav";

type Item = { label: string; href?: string; soon?: boolean };

const COLUMNS: { title: string; items: Item[] }[] = [
  {
    title: "Product",
    items: [
      { label: "How it works", href: "/#how" },
      { label: "Debate World", href: "/#worlds" },
      { label: "Extempore World", href: "/#worlds" },
      { label: "Progress", href: "/develop" },
      { label: "Pricing", soon: true },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Our vision", href: "/#vision" },
      { label: "Building in public", href: "/develop" },
      { label: "Contact", href: "mailto:hello@giftofwords.app" },
      { label: "Careers", soon: true },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/legal#privacy" },
      { label: "Terms", href: "/legal#terms" },
      { label: "Cookies", href: "/legal#cookies" },
      { label: "Accessibility", href: "/legal#accessibility" },
      { label: "Security", href: "/legal#security" },
    ],
  },
  {
    title: "For",
    items: [
      { label: "Students", href: "/#worlds" },
      { label: "Parents & guardians", href: "/legal#guardians" },
      { label: "Schools & clubs", soon: true },
      { label: "Coaches", soon: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="shell py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          {/* brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Mark size={28} />
              <span className="font-display text-[0.82rem] font-medium uppercase tracking-[0.24em] text-fg">
                Gift of Words
              </span>
            </Link>

            <p className="mt-5 max-w-[34ch] text-[0.9rem] leading-relaxed text-muted">
              A training ground for people who want their ideas to land. Two
              worlds, one voice, built in the open.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="mailto:hello@giftofwords.app"
                className="link-underline w-fit font-display text-[0.88rem] text-fg"
              >
                hello@giftofwords.app
              </a>
              <span className="flex items-center gap-2 text-[0.78rem] text-faint">
                <span className="pill-dot" />
                Building in public · first cohort soon
              </span>
            </div>
          </div>

          {/* links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] text-faint">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="link-underline text-[0.86rem] text-muted hover:text-fg"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2 text-[0.86rem] text-faint">
                          {item.label}
                          <span className="rounded-full border border-line px-1.5 py-px text-[0.6rem] uppercase tracking-wider">
                            soon
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.78rem] text-faint">
            © {new Date().getFullYear()} Gift of Words. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.78rem] text-faint">
            <span className="flex items-center gap-1.5">
              Made in India
              <span aria-hidden="true">🇮🇳</span>
            </span>
            <Link href="/legal#privacy" className="link-underline hover:text-fg">
              Privacy
            </Link>
            <Link href="/legal#terms" className="link-underline hover:text-fg">
              Terms
            </Link>
            <a href="#top" className="link-underline hover:text-fg">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
