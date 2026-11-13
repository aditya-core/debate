import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import OtpForm from "@/components/auth/OtpForm";
import { VERIFICATION_ENABLED } from "@/lib/auth/config";
import { getAccountContext, hasVerified } from "@/lib/auth/guard";
import { issueVerificationCode, maskEmail } from "@/lib/auth/otp";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Verify your email — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  if (!isSupabaseConfigured) redirect("/signin?state=unconfigured");
  if (!VERIFICATION_ENABLED) redirect("/account");

  const ctx = await getAccountContext();
  if (!ctx) redirect("/signin");

  if (!ctx.account) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-[1.5rem] font-medium tracking-[-0.02em] text-fg">
          Your login exists, your account row doesn&apos;t.
        </h1>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
          Run the migrations (<code className="rounded bg-surface-2 px-1.5 py-0.5">0001 → 0005</code>)
          and reload.
        </p>
        <Link href="/" className="btn btn-outline btn-sm mt-7">
          Back to the homepage
        </Link>
      </div>
    );
  }

  // Already proven: there is nothing to do here.
  if (hasVerified(ctx)) redirect("/onboarding");

  // Opening this page *is* the request for a code — the resend cooldown in SQL
  // makes a reload harmless, and it means a learner who navigated away still
  // gets a fresh code without hunting for a button.
  const issued = await issueVerificationCode();
  const senderMissing = issued.error === "no-sender" || issued.error === "provider-error";

  return (
    <div className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--c-brand-soft) 0%, transparent 65%), radial-gradient(45% 45% at 85% 90%, var(--c-flare-soft) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-lg">
        <p className="font-display text-[0.64rem] uppercase tracking-[0.22em] text-faint">
          Step one of two
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.7rem,4vw,2.3rem)] font-medium leading-tight tracking-[-0.03em] text-fg">
          Check your inbox
        </h1>

        <div className="mt-7 rounded-2xl border border-line bg-surface p-5 elevated sm:p-7">
          <OtpForm
            maskedEmail={maskEmail(issued.email ?? ctx.account.email)}
            initialResendAfter={issued.resendAfter}
            devPreview={issued.dev}
            senderMissing={senderMissing}
          />
        </div>

        <p className="mt-6 text-center text-[0.76rem] leading-relaxed text-faint">
          Wrong address?{" "}
          <Link href="/auth/signout" className="link-underline text-fg">
            Sign out
          </Link>{" "}
          and register again.
        </p>
      </div>
    </div>
  );
}
