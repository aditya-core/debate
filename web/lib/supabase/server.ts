import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, requireSupabase } from "@/lib/env";

/**
 * Server-side Supabase client bound to the request's cookies.
 * Uses the anon key only — authorisation is enforced by RLS in Postgres.
 */
export async function createServerSupabase() {
  requireSupabase();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: cookies are read-only there.
          // Session refresh is handled by the action/route that writes them.
        }
      },
    },
  });
}

export async function getSessionUser() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const { createServerClient: csc } = await import("@supabase/ssr");
  const cookieStore = await cookies();
  const supabase = csc(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
