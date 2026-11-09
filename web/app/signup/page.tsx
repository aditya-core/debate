import type { Metadata } from "next";
import EarlyAccess from "@/components/EarlyAccess";

export const metadata: Metadata = {
  title: "Begin your journey — Gift of Words",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <EarlyAccess
      eyebrow="Gift of Words"
      title="You're early."
      body="Registration opens with the first cohort. The practice arena, the scorecards and the two worlds are being built right now."
    />
  );
}
