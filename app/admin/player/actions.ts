"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlayerInput = {
  full_name: string;
  nickname: string;
  email: string;
  whatsapp: string;
  level: "newbie" | "beginner" | "intermediate" | "advance";
  gender: "pria" | "wanita" | "";
  instagram: string;
  role: "member" | "admin";
};

function clean(value: string) {
  return value.trim() === "" ? null : value.trim();
}

export async function createPlayer(input: PlayerInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("players").insert({
    full_name: clean(input.full_name),
    nickname: clean(input.nickname),
    email: clean(input.email),
    whatsapp: clean(input.whatsapp),
    level: input.level,
    gender: input.gender || null,
    instagram: clean(input.instagram),
    role: input.role,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/player");
  return { error: null };
}

export async function updatePlayer(id: string, input: PlayerInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("players")
    .update({
      full_name: clean(input.full_name),
      nickname: clean(input.nickname),
      email: clean(input.email),
      whatsapp: clean(input.whatsapp),
      level: input.level,
      gender: input.gender || null,
      instagram: clean(input.instagram),
      role: input.role,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/player");
  return { error: null };
}

export async function deletePlayer(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/player");
  return { error: null };
}

/**
 * Hapus PERMANEN: hapus baris players DAN akun Google (auth.users) yang
 * ter-link, jadi orangnya benar-benar bersih dari sistem (kalau daftar
 * lagi pakai email sama, dianggap pemain baru). Beda dari deletePlayer
 * biasa yang cuma hapus baris players, akun Google-nya tetap ada.
 */
export async function hardDeletePlayer(id: string) {
  const supabase = await createClient();

  // Double-check di sini juga (bukan cuma andalkan middleware /admin/*),
  // soalnya action ini pakai admin client yang bisa bypass RLS.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Belum login." };

  const { data: caller } = await supabase
    .from("players")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (caller?.role !== "admin") return { error: "Bukan admin." };

  const { data: target } = await supabase
    .from("players")
    .select("auth_user_id")
    .eq("id", id)
    .maybeSingle();
  if (!target) return { error: "Pemain tidak ditemukan." };

  if (target.auth_user_id === user.id) {
    return { error: "Tidak bisa hapus akun sendiri." };
  }

  // Hapus akun auth dulu (kalau ada) sebelum hapus baris players, supaya
  // kalau ini gagal, baris players belum ikut kehapus (gak setengah jalan).
  if (target.auth_user_id) {
    const adminClient = createAdminClient();
    const { error: authError } = await adminClient.auth.admin.deleteUser(
      target.auth_user_id
    );
    if (authError) return { error: authError.message };
  }

  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/player");
  return { error: null };
}
