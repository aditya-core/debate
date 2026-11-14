import type { Metadata } from "next";
import HistoryView from "@/components/studio/HistoryView";
import { requireOnboardedAccount } from "@/lib/auth/guard";
import { loadHistory } from "@/lib/studio/pages";

export const metadata: Metadata = {
  title: "Practice history — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const ctx = await requireOnboardedAccount();
  const data = await loadHistory(ctx);
  return <HistoryView data={data} />;
}
