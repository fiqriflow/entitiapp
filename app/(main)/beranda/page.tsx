import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AnnouncementCarousel from "@/components/beranda/AnnouncementCarousel";
import HeroBannerCarousel from "@/components/beranda/HeroBannerCarousel";
import { LEVEL_OPTIONS, formatRupiah, isMabarCompleted, levelRangeLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function countBy(rows: { level?: string | null; gender?: string | null }[], key: "level" | "gender") {
  return rows.reduce((acc: Record<string, number>, row) => {
    const value = row[key];
    if (!value) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

export default async function BerandaPage() {
  const supabase = await createClient();

  const [
    { data: banners },
    { data: announcements },
    { data: players },
    { data: mabarEvents },
    { data: participants },
  ] = await Promise.all([
    supabase
      .from("hero_banners")
      .select("id, image_url, link_url")
      .eq("is_active", true)
      .eq("purpose", "beranda")
      .order("sort_order", { ascending: true }),
    supabase
      .from("announcements")
      .select("id, title, content, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("players").select("level, gender"),
    supabase
      .from("mabar_events")
      .select("id, title, location, event_date, start_time, max_slot, price, status, is_private, completion_override, level_min, level_max, gender_restriction")
      .eq("status", "active")
      .order("event_date", { ascending: true })
      .limit(10),
    supabase.from("mabar_participants").select("mabar_id").eq("status", "joined"),
  ]);

  const total = players?.length ?? 0;
  const byLevel = countBy(players ?? [], "level");
  const byGender = countBy(players ?? [], "gender");

  const countByMabar: Record<string, number> = {};
  for (const row of participants ?? []) {
    countByMabar[row.mabar_id] = (countByMabar[row.mabar_id] ?? 0) + 1;
  }

  const upcomingMabarEvents = (mabarEvents ?? [])
    .filter((ev) => !isMabarCompleted(ev.event_date, ev.completion_override))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      {(banners ?? []).length > 0 && (
        <HeroBannerCarousel banners={banners ?? []} />
      )}

      {/* Pengumuman */}
      <section>
        <h2 className="text-sm font-semibold text-ink">📣 Pengumuman</h2>
        <div className="mt-3">
          <AnnouncementCarousel announcements={announcements ?? []} />
        </div>
      </section>

      {/* Dashboard */}
      <section>
        <h2 className="text-sm font-semibold text-ink">📊 Komunitas Kita</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-black/10 bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-ink">{total}</p>
            <p className="mt-0.5 text-xs text-ink/50">Total Pemain</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-ink">
              {byGender["pria"] ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-ink/50">Pria</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-ink">
              {byGender["wanita"] ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-ink/50">Wanita</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium text-ink/50">Berdasarkan Level</p>
          <div className="mt-3 space-y-2.5">
            {LEVEL_OPTIONS.map(({ value: key, label }) => {
              const count = byLevel[key] ?? 0;
              const percent = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-ink/70">{label}</span>
                    <span className="text-ink/50">{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
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
      </section>

      {/* Event Mabar */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">🏸 Event Mabar</h2>
          <Link href="/game" className="text-xs font-medium text-brand-dark">
            Lihat semua
          </Link>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar snap-x snap-mandatory">
          {upcomingMabarEvents.map((ev) => {
            const joined = countByMabar[ev.id] ?? 0;
            return (
              <Link
                key={ev.id}
                href={`/mabar/${ev.id}`}
                className="block w-64 shrink-0 snap-start rounded-xl border border-black/10 bg-white p-4 transition hover:border-brand/30"
              >
                <p className="text-sm font-semibold text-ink">
                  {ev.title}
                  {ev.is_private && (
                    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 align-middle">
                      🔒 Privat
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {formatDate(ev.event_date)} · {ev.start_time?.slice(0, 5)}
                  {ev.location ? ` · 📍 ${ev.location}` : ""}
                </p>
                <p className="mt-0.5 text-xs font-medium text-brand-dark">
                  {formatRupiah(ev.price)}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-ink/50">
                    {levelRangeLabel(ev.level_min, ev.level_max)}
                  </span>
                  {ev.gender_restriction && (
                    <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-ink/50">
                      {ev.gender_restriction === "pria" ? "Man Only" : "Woman Only"}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-ink/60">
                  {joined}/{ev.max_slot} slot terisi
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{
                      width: `${Math.min(100, (joined / ev.max_slot) * 100)}%`,
                    }}
                  />
                </div>
              </Link>
            );
          })}
          {upcomingMabarEvents.length === 0 && (
            <div className="w-full rounded-xl border border-dashed border-black/10 bg-white p-4 text-center text-sm text-ink/40">
              Belum ada jadwal mabar aktif.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
