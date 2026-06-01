import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client built from the environment variables, or null if
 * they have not been configured yet. We create it lazily (per request) so the
 * app still builds and renders even before you paste in your keys.
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Trim to guard against a stray newline or whitespace sneaking in when these
  // values are pasted into .env.local or the Vercel dashboard. An untrimmed
  // trailing "\n" turns the anon key into an invalid HTTP header value, which
  // throws `TypeError: Headers.set: "..." is an invalid header value` when the
  // Supabase client attaches it as the apikey / Authorization header.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey || url.includes("your-project-ref")) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
