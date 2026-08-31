"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createAvatarPreset(imageUrl: string, sortOrder: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const { error } = await supabase.from("avatar_presets").insert({
    image_url: imageUrl,
    sort_order: sortOrder,
    created_by: me?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/avatar");
  revalidatePath("/profil");
  return { error: null };
}

export async function toggleAvatarPresetActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("avatar_presets")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/avatar");
  revalidatePath("/profil");
  return { error: null };
}

export async function updateAvatarPresetOrder(id: string, sortOrder: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("avatar_presets")
    .update({ sort_order: sortOrder })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/avatar");
  revalidatePath("/profil");
  return { error: null };
}

export async function deleteAvatarPreset(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("avatar_presets")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/avatar");
  revalidatePath("/profil");
  return { error: null };
}
