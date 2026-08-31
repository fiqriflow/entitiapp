import { createClient } from "@/lib/supabase/server";
import { LEVEL_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const GENDER_LABEL: Record<string, string> = {
  pria: "Pria",
  wanita: "Wanita",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("level, gender");

  const total = players?.length ?? 0;

  const byLevel = countBy(players ?? [], "level");
  const byGender = countBy(players ?? [], "gender");

  const { count: activeMabarCount } = await supabase
    .from("mabar_events")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/60">
        Ringkasan data pemain & mabar komunitas.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Pemain" value={total} />
        <StatCard label="Mabar Aktif" value={activeMabarCount ?? 0} />
        <StatCard
          label="Pria"
          value={byGender["pria"] ?? 0}
          sub={`${pct(byGender["pria"], total)}%`}
        />
        <StatCard
          label="Wanita"
          value={byGender["wanita"] ?? 0}
          sub={`${pct(byGender["wanita"], total)}%`}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <BreakdownCard
          title="Berdasarkan Level"
          data={byLevel}
          labels={LEVEL_LABEL}
          total={total}
        />
        <BreakdownCard
          title="Berdasarkan Gender"
          data={byGender}
          labels={GENDER_LABEL}
          total={total}
        />
      </div>
    </div>
  );
}

function countBy(
  rows: Record<string, unknown>[],
  key: string
): Record<string, number> {
  return rows.reduce((acc: Record<string, number>, row) => {
    const value = row[key] as string | null;
    if (!value) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function pct(count: number | undefined, total: number) {
  if (!total) return 0;
  return Math.round(((count ?? 0) / total) * 100);
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <p className="text-xs font-medium text-ink/50">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">
        {value}
        {sub && (
          <span className="ml-1.5 text-xs font-medium text-ink/40">
            ({sub})
          </span>
        )}
      </p>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  labels,
  total,
}: {
  title: string;
  data: Record<string, number>;
  labels: Record<string, string>;
  total: number;
}) {
  const entries = Object.entries(labels);

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="mt-4 space-y-3">
        {entries.map(([key, label]) => {
          const count = data[key] ?? 0;
          const percent = pct(count, total);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink/70">{label}</span>
                <span className="text-ink/50">
                  {count} ({percent}%)
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
