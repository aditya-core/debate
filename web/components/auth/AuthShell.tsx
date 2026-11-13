import Link from "next/link";
import { Mark } from "@/components/Mark";

/**
 * Split layout shared by sign-up and sign-in: the identity model on the left,
 * the form on the right. The left panel is the one place on the site where the
 * "one account, two worlds" architecture is explained visually.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-[100svh] lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* left: the idea */}
      <aside className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, #4b1fd6 0%, #6a3cf0 38%, #a63ad0 72%, #ff3d8b 100%)",
          }}
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <Mark size={26} />
            <span className="font-display text-[0.78rem] font-medium uppercase tracking-[0.24em]">
              Gift of Words
            </span>
          </Link>

          <div>
            <h2 className="max-w-[16ch] font-display text-[clamp(1.9rem,2.6vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.03em] text-white">
              One account.
              <br />
              Two worlds.
            </h2>
            <p className="mt-4 max-w-[38ch] text-[0.92rem] leading-relaxed text-white/75">
              Your single login holds two permanent identities. They share you —
              never your scores.
            </p>

            <div className="mt-8 space-y-2.5">
              <IdentityRow label="Account" id="GOW-USER-7K4M2QW" tone="solid" />
              <div className="ml-5 space-y-2.5 border-l border-white/25 pl-5">
                <IdentityRow label="Debate" id="GOW-DEB-3XPN8T4" tone="soft" />
                <IdentityRow label="Extempore" id="GOW-EXT-9RJD5V2" tone="soft" />
              </div>
            </div>

            <p className="mt-6 text-[0.72rem] uppercase tracking-[0.16em] text-white/50">
              Illustrative identifiers
            </p>
          </div>

          <p className="max-w-[40ch] text-[0.82rem] leading-relaxed text-white/60">
            Free while we build. A parent or guardian approves accounts under 18
            before any practice is recorded.
          </p>
        </div>
      </aside>

      {/* right: the form */}
      <div className="flex min-h-[100svh] flex-col justify-center px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-[430px]">
          <div className="lg:hidden">
            <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
              <Mark size={24} />
              <span className="font-display text-[0.74rem] font-medium uppercase tracking-[0.22em] text-fg">
                Gift of Words
              </span>
            </Link>
          </div>

          <h1 className="font-display text-[1.9rem] font-medium leading-tight tracking-[-0.03em] text-fg">
            {title}
          </h1>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>

        {/* Everything the marketing footer would have said, in one line. */}
        <nav
          aria-label="Legal"
          className="mx-auto mt-12 flex w-full max-w-[430px] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.72rem] text-faint"
        >
          <Link href="/legal#terms" className="link-underline transition-colors hover:text-fg">
            Terms &amp; conditions
          </Link>
          <span aria-hidden="true" className="text-faint/40">
            ·
          </span>
          <Link href="/legal#privacy" className="link-underline transition-colors hover:text-fg">
            Privacy policy
          </Link>
          <span aria-hidden="true" className="text-faint/40">
            ·
          </span>
          <Link href="/" className="link-underline transition-colors hover:text-fg">
            giftofwords.app
          </Link>
        </nav>
      </div>
    </div>
  );
}

function IdentityRow({
  label,
  id,
  tone,
}: {
  label: string;
  id: string;
  tone: "solid" | "soft";
}) {
  return (
    <div
      className={[
        "flex items-center justify-between rounded-xl border px-3.5 py-2.5 backdrop-blur-sm",
        tone === "solid"
          ? "border-white/35 bg-white/15"
          : "border-white/20 bg-white/8",
      ].join(" ")}
    >
      <span className="font-display text-[0.68rem] uppercase tracking-[0.16em] text-white/70">
        {label}
      </span>
      <span className="font-display text-[0.72rem] tracking-[0.04em] text-white/90">
        {id}
      </span>
    </div>
  );
}
