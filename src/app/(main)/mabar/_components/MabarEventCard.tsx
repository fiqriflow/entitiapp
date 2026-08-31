import Link from "next/link";
import { formatRupiah, levelRangeLabel } from "@/lib/constants";

export type MabarCardData = {
  id: string;
  title: string;
  location: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  max_slot: number;
  price: number;
  status: string;
  is_private: boolean;
  completion_override?: "selesai" | "belum" | null;
  level_min?: string;
  level_max?: string;
  gender_restriction?: "pria" | "wanita" | null;
  joined_count: number;
  my_status?: "joined" | "waitlist" | "pending" | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function MabarEventCard({
  event,
  showCompletionBadge = false,
}: {
  event: MabarCardData;
  showCompletionBadge?: boolean;
}) {
  const percent = Math.min(100, (event.joined_count / event.max_slot) * 100);
  const full = event.joined_count >= event.max_slot;
  const isCancelled = event.status !== "active";

  return (
    <Link
      href={`/mabar/${event.id}`}
      className="block rounded-xl border border-black/10 bg-white p-4 transition hover:border-brand/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold text-ink">{event.title}</p>
            {event.is_private && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                🔒 Privat
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink/50">
            {formatDate(event.event_date)} · {event.start_time?.slice(0, 5)}
            {event.end_time ? `–${event.end_time.slice(0, 5)}` : ""}
          </p>
          {event.location && (
            <p className="mt-0.5 text-xs text-ink/50">📍 {event.location}</p>
          )}
          <p className="mt-0.5 text-xs font-medium text-brand-dark">
            {formatRupiah(event.price)}
          </p>
          {(event.level_min || event.gender_restriction) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {event.level_min && event.level_max && (
                <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-ink/50">
                  {levelRangeLabel(event.level_min, event.level_max)}
                </span>
              )}
              {event.gender_restriction && (
                <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-ink/50">
                  {event.gender_restriction === "pria" ? "Man Only" : "Woman Only"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {showCompletionBadge ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isCancelled
                  ? "bg-red-100 text-red-600"
                  : "bg-neutral-100 text-ink/50"
              }`}
            >
              {isCancelled ? "Batal" : "Selesai"}
            </span>
          ) : (
            isCancelled && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-ink/50">
                Ditutup
              </span>
            )
          )}
          {event.my_status === "joined" && (
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand-dark">
              Kamu ikut
            </span>
          )}
          {event.my_status === "waitlist" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Waitlist
            </span>
          )}
          {event.my_status === "pending" && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              Menunggu approval
            </span>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-ink/60">
        {event.joined_count}/{event.max_slot} slot terisi
        {full && event.status === "active" ? " · Penuh" : ""}
      </p>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${percent}%` }}
        />
      </div>
    </Link>
  );
}
