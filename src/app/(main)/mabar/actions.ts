"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { levelInRange } from "@/lib/constants";

async function getMyPlayer(): Promise<{
  playerId: string | null;
  isComplete: boolean;
  level: string | null;
  gender: string | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { playerId: null, isComplete: false, level: null, gender: null, error: "Kamu belum login." };

  const { data: me } = await supabase
    .from("players")
    .select("id, full_name, whatsapp, gender, level")
    .eq("auth_user_id", user.id)
    .single();

  if (!me) {
    return { playerId: null, isComplete: false, level: null, gender: null, error: "Profil pemain tidak ditemukan." };
  }

  const isComplete = Boolean(me.full_name && me.whatsapp && me.gender);

  return { playerId: me.id, isComplete, level: me.level, gender: me.gender, error: null };
}

export async function joinMabar(mabarId: string) {
  const supabase = await createClient();
  const { playerId, isComplete, level, gender, error: playerError } = await getMyPlayer();
  if (!playerId) return { error: playerError };
  if (!isComplete) return { error: null, needsProfile: true };

  const { data: event, error: eventError } = await supabase
    .from("mabar_events")
    .select("max_slot, status, is_private, level_min, level_max, gender_restriction")
    .eq("id", mabarId)
    .single();

  if (eventError || !event) return { error: "Mabar tidak ditemukan." };
  if (event.status !== "active") return { error: "Mabar ini sudah ditutup." };

  if (!levelInRange(level, event.level_min, event.level_max)) {
    return { error: "Level kamu belum memenuhi syarat mabar ini." };
  }

  if (event.gender_restriction && gender !== event.gender_restriction) {
    return {
      error:
        event.gender_restriction === "pria"
          ? "Mabar ini khusus pria (Man Only)."
          : "Mabar ini khusus wanita (Woman Only).",
    };
  }

  let status: "joined" | "waitlist" | "pending";

  if (event.is_private) {
    status = "pending";
  } else {
    const { count: joinedCount } = await supabase
      .from("mabar_participants")
      .select("*", { count: "exact", head: true })
      .eq("mabar_id", mabarId)
      .eq("status", "joined");

    status = (joinedCount ?? 0) < event.max_slot ? "joined" : "waitlist";
  }

  const { error } = await supabase.from("mabar_participants").insert({
    mabar_id: mabarId,
    player_id: playerId,
    status,
  });

  if (error) return { error: error.message };

  revalidatePath(`/mabar/${mabarId}`);
  revalidatePath("/mabar");
  revalidatePath("/beranda");
  return { error: null, status };
}

export async function leaveMabar(mabarId: string) {
  const supabase = await createClient();
  const { playerId, error: playerError } = await getMyPlayer();
  if (!playerId) return { error: playerError };

  const { data: myRow } = await supabase
    .from("mabar_participants")
    .select("id, status")
    .eq("mabar_id", mabarId)
    .eq("player_id", playerId)
    .single();

  const { error } = await supabase
    .from("mabar_participants")
    .delete()
    .eq("mabar_id", mabarId)
    .eq("player_id", playerId);

  if (error) return { error: error.message };

  // Kalau yang keluar berstatus "joined", promosikan orang waitlist
  // paling awal jadi "joined" supaya slot kosong terisi otomatis.
  if (myRow?.status === "joined") {
    const { data: nextInLine } = await supabase
      .from("mabar_participants")
      .select("id")
      .eq("mabar_id", mabarId)
      .eq("status", "waitlist")
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextInLine) {
      await supabase
        .from("mabar_participants")
        .update({ status: "joined" })
        .eq("id", nextInLine.id);
    }
  }

  revalidatePath(`/mabar/${mabarId}`);
  revalidatePath("/mabar");
  revalidatePath("/beranda");
  return { error: null };
}
