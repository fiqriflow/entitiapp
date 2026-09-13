import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk dipakai di Client Component ("use client").
 * Pakai anon key — aman untuk browser karena RLS yang menjaga akses data.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
