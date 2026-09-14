import { createClient, getCurrentUser } from "@/lib/supabase/server";
import MabarTabs from "@/components/mabar/MabarTabs";
import type { MabarCardData } from "@/components/mabar/MabarEventCard";
import { isMabarCompleted } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MabarPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: me } = await supabase
    .from("players")
    .select("id, role")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  const [{ data: events }, { data: participants }, { count: totalMembers }] =
    await Promise.all([
      supabase
        .from("mabar_events")
        .select(
          "id, title, location, event_date, start_time, end_time, max_slot, price, status, is_private, completion_override, level_min, level_max, gender_restriction, creator:players!created_by(nickname, full_name)"
        )
        .order("event_date", { ascending: true }),
      supabase
        .from("mabar_participants")
        .select("mabar_id, player_id, status, players(nickname, full_name)"),
      supabase.from("players").select("id", { count: "exact", head: true }),
    ]);

  const joinedCountByMabar: Record<string, number> = {};
  const myStatusByMabar: Record<string, "joined" | "waitlist" | "pending"> = {};
  const namesByMabar: Record<string, (string | null)[]> = {};

  for (const row of participants ?? []) {
    if (row.status === "joined") {
      joinedCountByMabar[row.mabar_id] =
        (joinedCountByMabar[row.mabar_id] ?? 0) + 1;
      const p = row.players as { nickname: string | null; full_name: string | null } | null;
      (namesByMabar[row.mabar_id] ??= []).push(p?.nickname || p?.full_name || null);
    }
    if (me && row.player_id === me.id) {
      myStatusByMabar[row.mabar_id] = row.status as "joined" | "waitlist" | "pending";
    }
  }

  const allEvents: MabarCardData[] = (events ?? []).map((ev) => {
    const { creator, ...rest } = ev as typeof ev & {
      creator: { nickname: string | null; full_name: string | null } | null;
    };
    return {
      ...rest,
      joined_count: joinedCountByMabar[ev.id] ?? 0,
      my_status: myStatusByMabar[ev.id] ?? null,
      creator_name: creator?.nickname || creator?.full_name || null,
      total_members: totalMembers ?? 0,
      participant_names: namesByMabar[ev.id] ?? [],
    };
  });

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
