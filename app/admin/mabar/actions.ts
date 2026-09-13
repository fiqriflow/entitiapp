"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MabarInput = {
  title: string;
  description: string;
  location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  max_slot: number;
  price: number;
  status: "active" | "closed";
  is_private: boolean;
  level_min: string;
  level_max: string;
  gender_restriction: "pria" | "wanita" | "";
  girl_balance: boolean;
};

function clean(value: string) {
  return value.trim() === "" ? null : value.trim();
}

export async function createMabarEvent(input: MabarInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user?.id)
    .single();

  const { error } = await supabase.from("mabar_events").insert({
    title: input.title.trim(),
    description: clean(input.description),
    location: clean(input.location),
    event_date: input.event_date,
    start_time: input.start_time,
    end_time: clean(input.end_time),
    max_slot: input.max_slot,
    price: input.price,
    status: input.status,
    is_private: input.is_private,
    level_min: input.level_min,
    level_max: input.level_max,
    gender_restriction: input.gender_restriction || null,
    girl_balance: input.girl_balance,
    created_by: me?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  revalidatePath("/beranda");
  return { error: null };
}

export async function updateMabarEvent(id: string, input: MabarInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_events")
    .update({
      title: input.title.trim(),
      description: clean(input.description),
      location: clean(input.location),
      event_date: input.event_date,
      start_time: input.start_time,
      end_time: clean(input.end_time),
      max_slot: input.max_slot,
      price: input.price,
      status: input.status,
      is_private: input.is_private,
      level_min: input.level_min,
      level_max: input.level_max,
      gender_restriction: input.gender_restriction || null,
      girl_balance: input.girl_balance,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  revalidatePath("/beranda");
  return { error: null };
}

export async function toggleMabarStatus(
  id: string,
  status: "active" | "closed"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_events")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  revalidatePath("/beranda");
  return { error: null };
}

export async function deleteMabarEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("mabar_events").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  revalidatePath("/beranda");
  return { error: null };
}

export async function approveParticipant(participantId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_participants")
    .update({ status: "joined" })
    .eq("id", participantId);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  return { error: null };
}

export async function rejectParticipant(participantId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_participants")
    .delete()
    .eq("id", participantId);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  return { error: null };
}

export async function togglePaymentStatus(
  participantId: string,
  isPaid: boolean
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_participants")
    .update({ is_paid: isPaid })
    .eq("id", participantId);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  return { error: null };
}

export async function toggleCheckIn(participantId: string, checkedIn: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_participants")
    .update({
      checked_in: checkedIn,
      checked_in_at: checkedIn ? new Date().toISOString() : null,
    })
    .eq("id", participantId);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  return { error: null };
}

export async function setCompletionOverride(
  id: string,
  value: "selesai" | "belum" | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_events")
    .update({ completion_override: value })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  revalidatePath("/mabar");
  revalidatePath("/beranda");
  return { error: null };
}
