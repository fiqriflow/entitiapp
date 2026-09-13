"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getMyPlayerId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  return me?.id ?? null;
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const playerId = await getMyPlayerId();
  if (!playerId) return { error: "Kamu belum login." };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("player_id", playerId);

  if (error) return { error: error.message };

  revalidatePath("/notifikasi");
  return { error: null };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const playerId = await getMyPlayerId();
  if (!playerId) return { error: "Kamu belum login." };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("player_id", playerId)
    .eq("is_read", false);

  if (error) return { error: error.message };

  revalidatePath("/notifikasi");
  revalidatePath("/beranda");
  revalidatePath("/mabar");
  revalidatePath("/profil");
  return { error: null };
}

export async function clearAllNotifications() {
  const supabase = await createClient();
  const playerId = await getMyPlayerId();
  if (!playerId) return { error: "Kamu belum login." };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("player_id", playerId);

  if (error) return { error: error.message };

  revalidatePath("/notifikasi");
  revalidatePath("/beranda");
  revalidatePath("/mabar");
  revalidatePath("/profil");
  return { error: null };
}

export async function deleteNotification(id: string) {
  const supabase = await createClient();
  const playerId = await getMyPlayerId();
  if (!playerId) return { error: "Kamu belum login." };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("player_id", playerId);

  if (error) return { error: error.message };

  revalidatePath("/notifikasi");
  return { error: null };
}
