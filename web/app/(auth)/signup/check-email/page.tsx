import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Check your inbox — Gift of Words",
  robots: { index: false, follow: false },
};

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; guardian?: string }>;
}) {
  const { email, guardian } = await searchParams;
  const address = email?.trim() || "your inbox";
  const needsGuardian = guardian === "1";

  return (
    <AuthShell
      title="Check your inbox"
      subtitle="We've sent a confirmation link to finish setting up your account."
      footer={
        <p className="text-center text-[0.78rem] text-faint">
          Wrong address?{" "}
          <Link href="/signup" className="link-underline text-fg">
            Start over
          </Link>
        </p>
      }
    >
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white"
            style={{
              background:
                "linear-gradient(140deg, var(--c-brand) 0%, var(--c-flare) 100%)",
            }}
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 7.5 12 13l9-5.5M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="font-display text-[0.68rem] uppercase tracking-[0.16em] text-faint">
              Sent to
            </p>
            <p className="truncate text-[0.92rem] font-medium text-fg">{address}</p>
          </div>
        </div>

        <ol className="mt-5 space-y-3">
          <Step
            n="1"
            text="Open the email and click the confirmation link. It brings you straight back here, signed in."
          />
          <Step n="2" text="Your account, and both world identities, are created the moment you confirm." />
          {needsGuardian ? (
            <Step
              n="3"
              text="Because you're under 18, we also email your parent or guardian for approval. Practice unlocks once they agree."
            />
          ) : null}
        </ol>

        <p className="mt-5 border-t border-line pt-4 text-[0.78rem] leading-relaxed text-faint">
          Nothing after a few minutes? Check spam, then email{" "}
          <span className="text-fg">hello@giftofwords.app</span>. During the build
          we send from a limited mailbox, so delivery can be slower than usual.
        </p>
      </div>
    </AuthShell>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line font-display text-[0.65rem] text-muted">
        {n}
      </span>
      <span className="text-[0.85rem] leading-relaxed text-muted">{text}</span>
    </li>
  );
}
