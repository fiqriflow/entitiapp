import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Status 303 wajib di sini: redirect setelah POST harus memaksa
  // browser pakai GET, kalau tidak (default 307) browser akan
  // ikut nge-POST ke /login yang tidak punya handler POST.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
