"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCommitmentItem(text: string, sortOrder: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const { error } = await supabase.from("commitment_items").insert({
    text: text.trim(),
    sort_order: sortOrder,
    created_by: me?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/komitmen");
  revalidatePath("/mabar");
  return { error: null };
}

export async function updateCommitmentItem(id: string, text: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("commitment_items")
    .update({ text: text.trim() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/komitmen");
  revalidatePath("/mabar");
  return { error: null };
}

export async function toggleCommitmentItemActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("commitment_items")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/komitmen");
  revalidatePath("/mabar");
  return { error: null };
}

export async function updateCommitmentItemOrder(id: string, sortOrder: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("commitment_items")
    .update({ sort_order: sortOrder })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/komitmen");
  revalidatePath("/mabar");
  return { error: null };
}

export async function deleteCommitmentItem(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("commitment_items")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/komitmen");
  revalidatePath("/mabar");
  return { error: null };
}
