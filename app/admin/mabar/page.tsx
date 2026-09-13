import { createClient } from "@/lib/supabase/server";
import MabarListClient, {
  type PendingRow,
} from "@/components/admin/mabar/MabarListClient";
import type { MabarRow } from "@/components/admin/mabar/MabarFormModal";
import type { TemplateRow } from "@/components/admin/mabar/TemplatePickerModal";

export const dynamic = "force-dynamic";

export default async function AdminMabarPage() {
  const supabase = await createClient();

  const [{ data: events }, { data: participants }, { data: templates }] =
    await Promise.all([
      supabase
        .from("mabar_events")
        .select(
          "id, title, description, location, event_date, start_time, end_time, max_slot, price, status, is_private, completion_override, level_min, level_max, gender_restriction, girl_balance"
        )
        .order("event_date", { ascending: false }),
      supabase
        .from("mabar_participants")
        .select("id, mabar_id, status, is_paid, checked_in, players(full_name, nickname)"),
      supabase
        .from("mabar_templates")
        .select(
          "id, name, title, description, location, start_time, end_time, max_slot, price, is_private, level_min, level_max, gender_restriction"
        )
        .order("created_at", { ascending: false }),
    ]);

  const countByMabar: Record<string, number> = {};
  const paidByMabar: Record<string, number> = {};
  const checkedInByMabar: Record<string, number> = {};
  const pendingByMabar: Record<string, PendingRow[]> = {};

  for (const row of (participants ?? []) as unknown as (PendingRow & {
    status: string;
    is_paid: boolean;
    checked_in: boolean;
  })[]) {
    if (row.status === "joined") {
      countByMabar[row.mabar_id] = (countByMabar[row.mabar_id] ?? 0) + 1;
      if (row.is_paid) {
        paidByMabar[row.mabar_id] = (paidByMabar[row.mabar_id] ?? 0) + 1;
      }
      if (row.checked_in) {
        checkedInByMabar[row.mabar_id] =
          (checkedInByMabar[row.mabar_id] ?? 0) + 1;
      }
    }
    if (row.status === "pending") {
      pendingByMabar[row.mabar_id] = [
        ...(pendingByMabar[row.mabar_id] ?? []),
        row,
      ];
    }
  }

  const rows: MabarRow[] = (events ?? []).map((ev) => ({
    ...ev,
    joined_count: countByMabar[ev.id] ?? 0,
    paid_count: paidByMabar[ev.id] ?? 0,
    checked_in_count: checkedInByMabar[ev.id] ?? 0,
    pending_count: (pendingByMabar[ev.id] ?? []).length,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Mabar Event</h1>
      <p className="mt-1 text-sm text-ink/60">
        Kelola jadwal mabar komunitas. Toggle di tiap card untuk buka/tutup
        mabar dengan cepat.
      </p>

      <div className="mt-6">
        <MabarListClient
          events={rows}
          pendingByMabar={pendingByMabar}
          templates={(templates ?? []) as TemplateRow[]}
        />
      </div>
    </div>
  );
}
