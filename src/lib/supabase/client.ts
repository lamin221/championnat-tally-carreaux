import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase à utiliser dans les Client Components ("use client").
 * Utilise la clé publique (anon key) — la sécurité est assurée par les
 * politiques RLS définies dans supabase/migrations/0001_init.sql.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
