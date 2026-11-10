import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { isSupabaseConfigured } from "@/lib/env";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set a new password — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  if (!isSupabaseConfigured) redirect("/signin?state=unconfigured");

  // A recovery link lands here with a session. No session, no password form.
  const user = await getSessionUser();
  if (!user) redirect("/signin?state=link");

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Something you have not used on this account before."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
