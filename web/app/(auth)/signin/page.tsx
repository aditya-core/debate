import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SetupNotice from "@/components/auth/SetupNotice";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — Gift of Words",
  description: "Sign in to your Gift of Words account.",
  robots: { index: false, follow: true },
};

const STATES: Record<string, string> = {
  link: "That confirmation link has expired or was already used. Sign in below, or create the account again.",
  unconfigured: "This build has no database connection, so sign-in is switched off.",
};

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const notice = state ? STATES[state] : undefined;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Your practice record is exactly where you left it."
    >
      {notice ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-[0.84rem] leading-relaxed text-muted"
        >
          {notice}
        </div>
      ) : null}
      <SetupNotice />
      <SignInForm />
    </AuthShell>
  );
}
