import type { Metadata } from "next";
import AccountView from "@/components/studio/AccountView";
import { requireOnboardedAccount } from "@/lib/auth/guard";
import { loadAccountPageData } from "@/lib/studio/pages";

export const metadata: Metadata = {
  title: "Your account — Gift of Words",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const [{ password: passwordState }, ctx] = await Promise.all([
    searchParams,
    requireOnboardedAccount(),
  ]);
  const data = await loadAccountPageData(ctx);
  return <AccountView data={data} passwordState={passwordState} />;
}
