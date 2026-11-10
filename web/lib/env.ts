/**
 * Public configuration, resolved once.
 *
 * Only `NEXT_PUBLIC_*` values are read here — the service-role key must never
 * exist in this application. Every privileged operation goes through Row Level
 * Security and RPCs, not through a superuser connection.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20;

export function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local — see docs/SUPABASE-SETUP.md",
    );
  }
}
