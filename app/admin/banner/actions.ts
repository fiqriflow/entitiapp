"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BannerInput = {
  link_url: string;
  is_active: boolean;
  sort_order: number;
  purpose: "beranda" | "mabar_detail";
};

function clean(value: string) {
  return value.trim() === "" ? null : value.trim();
}

export async function createBanner(imageUrl: string, input: BannerInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const { error } = await supabase.from("hero_banners").insert({
    image_url: imageUrl,
    link_url: clean(input.link_url),
    is_active: input.is_active,
    sort_order: input.sort_order,
    purpose: input.purpose,
    created_by: me?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  revalidatePath("/mabar");
  return { error: null };
}

export async function updateBannerMeta(id: string, input: BannerInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hero_banners")
    .update({
      link_url: clean(input.link_url),
      is_active: input.is_active,
      sort_order: input.sort_order,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  revalidatePath("/mabar");
  return { error: null };
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hero_banners")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  return { error: null };
}

export async function deleteBanner(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("hero_banners").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  return { error: null };
}
