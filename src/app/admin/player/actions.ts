"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
