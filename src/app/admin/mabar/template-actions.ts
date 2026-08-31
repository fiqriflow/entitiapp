"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveEventAsTemplate(eventId: string, name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const { data: event, error: eventError } = await supabase
    .from("mabar_events")
    .select(
      "title, description, location, start_time, end_time, max_slot, price, is_private, level_min, level_max, gender_restriction"
    )
    .eq("id", eventId)
    .single();

  if (eventError || !event) return { error: "Mabar tidak ditemukan." };

  const { error } = await supabase.from("mabar_templates").insert({
    name: name.trim(),
    title: event.title,
    description: event.description,
    location: event.location,
    start_time: event.start_time,
    end_time: event.end_time,
    max_slot: event.max_slot,
    price: event.price,
    is_private: event.is_private,
    level_min: event.level_min,
    level_max: event.level_max,
    gender_restriction: event.gender_restriction,
    created_by: me?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  return { error: null };
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mabar_templates")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/mabar");
  return { error: null };
}
