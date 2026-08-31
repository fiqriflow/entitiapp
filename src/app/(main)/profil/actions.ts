"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileInput = {
  full_name: string;
  nickname: string;
  whatsapp: string;
  level: "newbie" | "beginner" | "intermediate" | "advance";
  gender: "pria" | "wanita" | "";
  instagram: string;
};

function clean(value: string) {
  return value.trim() === "" ? null : value.trim();
}

export async function updateMyProfile(input: ProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Kamu belum login." };

  const { error } = await supabase
    .from("players")
    .update({
      full_name: clean(input.full_name),
      nickname: clean(input.nickname),
      whatsapp: clean(input.whatsapp),
      level: input.level,
      gender: input.gender || null,
      instagram: clean(input.instagram),
    })
    .eq("auth_user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profil");
  revalidatePath("/beranda");
  return { error: null };
}

export async function updateMyAvatar(avatarUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Kamu belum login." };

  const { error } = await supabase
    .from("players")
    .update({ avatar_url: avatarUrl })
    .eq("auth_user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profil");
  revalidatePath("/beranda");
  return { error: null };
}
