import type { Metadata } from "next";
import ProgressView from "@/components/studio/ProgressView";
import { requireOnboardedAccount } from "@/lib/auth/guard";
import { loadDashboard } from "@/lib/dashboard/data";

export const metadata: Metadata = {
  title: "My progress — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const ctx = await requireOnboardedAccount();
  const data = await loadDashboard(ctx);
  return <ProgressView data={data} />;
}
