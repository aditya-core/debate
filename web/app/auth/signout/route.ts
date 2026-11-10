import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/http";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

/** POST-only: signing out should never happen from a prefetched GET. */
export async function POST(request: Request) {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }

  // 303 so the browser follows with a GET and the page is re-rendered signed out.
  return NextResponse.redirect(`${requestOrigin(request)}/`, 303);
}
