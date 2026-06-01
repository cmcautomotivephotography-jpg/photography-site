import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client built from the environment variables, or null if
 * they have not been configured yet. We create it lazily (per request) so the
 * app still builds and renders even before you paste in your keys.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes("your-project-ref")) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
