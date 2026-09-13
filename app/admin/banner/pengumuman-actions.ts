"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AnnouncementInput = {
  title: string;
  content: string;
  is_active: boolean;
};

function clean(value: string) {
  return value.trim() === "" ? null : value.trim();
}

export async function createAnnouncement(input: AnnouncementInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const { error } = await supabase.from("announcements").insert({
    title: input.title.trim(),
    content: clean(input.content),
    is_active: input.is_active,
    created_by: me?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  return { error: null };
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({
      title: input.title.trim(),
      content: clean(input.content),
      is_active: input.is_active,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  return { error: null };
}

export async function toggleAnnouncementActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  return { error: null };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/banner");
  revalidatePath("/beranda");
  return { error: null };
}
