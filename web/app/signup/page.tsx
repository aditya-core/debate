import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SetupNotice from "@/components/auth/SetupNotice";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create your account — Gift of Words",
  description:
    "One login, two worlds. Create your Gift of Words account to practise debate and extempore.",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="One login unlocks both worlds. It takes about a minute."
    >
      <SetupNotice />
      <SignUpForm />
    </AuthShell>
  );
}
