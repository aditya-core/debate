import type { Metadata } from "next";
import EarlyAccess from "@/components/EarlyAccess";

export const metadata: Metadata = {
  title: "Sign in — Gift of Words",
  robots: { index: false, follow: false },
};

export default function SigninPage() {
  return (
    <EarlyAccess
      eyebrow="Gift of Words"
      title="Accounts aren't open yet."
      body="There is nothing to sign into during the build. When the first cohort opens, your single account will unlock both worlds."
    />
  );
}
