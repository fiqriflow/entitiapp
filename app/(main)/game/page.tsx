import { createClient } from "@/lib/supabase/server";
import MabarEventCard, {
  type MabarCardData,
} from "@/components/mabar/MabarEventCard";
import { isMabarCompleted } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function GamePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const [{ data: events }, { data: participants }] = await Promise.all([
    supabase
      .from("mabar_events")
      .select(
        "id, title, location, event_date, start_time, end_time, max_slot, price, status, is_private, completion_override, level_min, level_max, gender_restriction"
      )
      .eq("status", "active")
      .order("event_date", { ascending: true }),
    supabase.from("mabar_participants").select("mabar_id, player_id, status"),
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

  const activeEvents: MabarCardData[] = (events ?? [])
    .map((ev) => ({
      ...ev,
      joined_count: joinedCountByMabar[ev.id] ?? 0,
      my_status: myStatusByMabar[ev.id] ?? null,
    }))
    .filter((ev) => !isMabarCompleted(ev.event_date, ev.completion_override));

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Game</h1>
      <p className="mt-1 text-sm text-ink/60">
        Cari & join jadwal mabar yang masih aktif.
      </p>

      <div className="mt-4 space-y-2.5">
        {activeEvents.map((event) => (
          <MabarEventCard key={event.id} event={event} />
        ))}
        {activeEvents.length === 0 && (
          <div className="rounded-xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink/40">
            Belum ada mabar aktif.
          </div>
        )}
      </div>
    </div>
  );
}
