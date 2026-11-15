import type { Metadata } from "next";
import StudioDashboard from "@/components/studio/StudioDashboard";
import { requireOnboardedAccount } from "@/lib/auth/guard";
import { loadDashboard } from "@/lib/dashboard/data";
import type { World, WorldUI } from "@/lib/dashboard/types";
import { TOPIC_LABELS } from "@/lib/onboarding/schema";
import { prepSeconds, speakSeconds } from "@/lib/practice/prompts";

export const metadata: Metadata = {
  title: "Home — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The gate is the same one the rest of the app uses: verified → onboarded →
 * here. Both worlds are resolved on the server and handed over together, so the
 * switch in the browser costs no round trip; the prompt library itself stays
 * behind on this side of the wire.
 */
export default async function DashboardPage() {
  const ctx = await requireOnboardedAccount();
  const data = await loadDashboard(ctx);

  const ui: Record<World, WorldUI> = {
    debate: {
      topicLabel: TOPIC_LABELS[data.today.debate.topic],
      prep: prepSeconds("debate"),
      speak: speakSeconds("debate"),
    },
    extempore: {
      topicLabel: TOPIC_LABELS[data.today.extempore.topic],
      prep: prepSeconds("extempore"),
      speak: speakSeconds("extempore"),
    },
  };

  return <StudioDashboard data={data} ui={ui} />;
}
