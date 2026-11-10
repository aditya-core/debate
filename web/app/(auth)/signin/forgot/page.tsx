import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import SetupNotice from "@/components/auth/SetupNotice";

export const metadata: Metadata = {
  title: "Reset your password — Gift of Words",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link that lets you set a new one."
    >
      <SetupNotice />
      <ForgotPasswordForm />
    </AuthShell>
  );
}
