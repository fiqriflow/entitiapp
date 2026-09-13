import { createClient } from "@/lib/supabase/server";
import MabarTabs from "@/components/mabar/MabarTabs";
import type { MabarCardData } from "@/components/mabar/MabarEventCard";
import { isMabarCompleted } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MabarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id, role")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const [{ data: events }, { data: participants }] = await Promise.all([
    supabase
      .from("mabar_events")
      .select(
        "id, title, location, event_date, start_time, end_time, max_slot, price, status, is_private, completion_override, level_min, level_max, gender_restriction"
      )
      .order("event_date", { ascending: true }),
    supabase
      .from("mabar_participants")
      .select("mabar_id, player_id, status"),
  ]);

  const joinedCountByMabar: Record<string, number> = {};
  const myStatusByMabar: Record<string, "joined" | "waitlist" | "pending"> = {};

  for (const row of participants ?? []) {
    if (row.status === "joined") {
      joinedCountByMabar[row.mabar_id] =
        (joinedCountByMabar[row.mabar_id] ?? 0) + 1;
    }
    if (me && row.player_id === me.id) {
      myStatusByMabar[row.mabar_id] = row.status as "joined" | "waitlist" | "pending";
    }
  }

  const allEvents: MabarCardData[] = (events ?? []).map((ev) => ({
    ...ev,
    joined_count: joinedCountByMabar[ev.id] ?? 0,
    my_status: myStatusByMabar[ev.id] ?? null,
  }));

  const myEvents = allEvents.filter(
    (ev) =>
      myStatusByMabar[ev.id] &&
      !isMabarCompleted(ev.event_date, ev.completion_override)
  );

  const pastEvents = allEvents
    .filter((ev) => isMabarCompleted(ev.event_date, ev.completion_override))
    .sort((a, b) => (a.event_date < b.event_date ? 1 : -1));

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Mabar</h1>
      <p className="mt-1 text-sm text-ink/60">
        Mabar yang sudah kamu ikuti, dan riwayat yang sudah selesai.
      </p>

      <div className="mt-4">
        <MabarTabs myEvents={myEvents} pastEvents={pastEvents} />
      </div>
    </div>
  );
}
