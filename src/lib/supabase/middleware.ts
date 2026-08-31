import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Halaman yang tidak butuh login
const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback", "/auth/auth-code-error"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Wajib dipanggil supaya token auto-refresh & tidak logout tiba-tiba
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = pathname.startsWith("/admin");

  // Belum login & buka halaman privat -> redirect ke /login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Sudah login tapi buka /login -> lempar ke beranda
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/beranda";
    return NextResponse.redirect(url);
  }

  // Cek role admin untuk /admin/*
  if (user && isAdminPath) {
    const { data: player } = await supabase
      .from("players")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    if (player?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/beranda";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
