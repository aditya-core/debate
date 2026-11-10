import { NextResponse } from "next/server";
import { requestOrigin, safePath } from "@/lib/http";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Landing point for the confirmation link in the sign-up email.
 *
 * Supabase returns a PKCE `code`; exchanging it writes the session cookies, so
 * the trigger-provisioned account is immediately readable by the page that
 * follows.
 */
export async function GET(request: Request) {
  const origin = requestOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safePath(url.searchParams.get("next"), "/account");

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${origin}/signin?state=unconfigured`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?state=link`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/signin?state=link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
