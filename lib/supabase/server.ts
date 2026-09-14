import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Supabase client untuk dipakai di Server Component, Server Action, atau Route Handler.
 * Perlu dibuat baru tiap request karena bergantung ke cookies() request tsb.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll dipanggil dari Server Component — boleh diabaikan
            // kalau ada middleware yang refresh session di request lain.
          }
        },
      },
    }
  );
}

/**
 * Sama seperti supabase.auth.getUser(), tapi di-cache per-request pakai
 * React cache(). Layout + page + komponen lain sering sama-sama manggil
 * getUser() di request yang sama — tanpa ini, tiap panggilan bikin round
 * trip network baru ke Supabase Auth (lambat, kerasa pas pindah menu).
 * Dengan cache(), dalam satu request cuma ada 1x panggilan network.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
