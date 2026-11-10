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
  const nextParam = url.searchParams.get("next");
  const next = safePath(nextParam, "/account");

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

  // No explicit destination (someone confirming a sign-up from their inbox):
  // setup comes first. A learner who skips it cannot reach the arenas.
  if (!nextParam) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: account } = await supabase
        .from("accounts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle<{ id: string }>();

      if (account) {
        const { data: learner } = await supabase
          .from("learner_profiles")
          .select("completed_at")
          .eq("account_id", account.id)
          .maybeSingle<{ completed_at: string | null }>();

        if (!learner?.completed_at) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
