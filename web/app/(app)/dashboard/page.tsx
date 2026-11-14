import type { Metadata } from "next";
import StudioDashboard from "@/components/studio/StudioDashboard";
import { requireOnboardedAccount } from "@/lib/auth/guard";
import { loadDashboard } from "@/lib/dashboard/data";
import { buildGuide } from "@/lib/dashboard/guide";

export const metadata: Metadata = {
  title: "Home — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The gate is the same one the rest of the app uses: verified → onboarded →
 * here. Nothing on this page is invented; the progress ring is four real gates
 * and the skill bars stay empty until the scorer exists to fill them.
 */
export default async function DashboardPage() {
  const ctx = await requireOnboardedAccount();
  const data = await loadDashboard(ctx);

  return <StudioDashboard data={data} guide={buildGuide(data, "debate")} />;
}
