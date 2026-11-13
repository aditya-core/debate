import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";
import { requireOnboardedAccount } from "@/lib/auth/guard";
import { loadDashboard } from "@/lib/dashboard/data";

export const metadata: Metadata = {
  title: "Your home — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The gate is the same one the rest of the app uses, so a half-finished account
 * can never see a home screen it has not earned: verified → onboarded → here.
 */
export default async function DashboardPage() {
  const ctx = await requireOnboardedAccount();
  const data = await loadDashboard(ctx);

  return <Dashboard data={data} />;
}
