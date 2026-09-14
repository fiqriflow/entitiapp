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
  creator_name?: string | null;
  total_members?: number;
  participant_names?: (string | null)[];
};

const AVATAR_COLORS = [
  "bg-neutral-200 text-ink/60",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-neutral-200 text-ink/60",
  "bg-purple-100 text-purple-700",
];

function initials(name: string | null) {
  if (!name) return "?";
  return name.trim().slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MabarEventCard({
  event,
  showCompletionBadge = false,
}: {
  event: MabarCardData;
  showCompletionBadge?: boolean;
}) {
  const full = event.joined_count >= event.max_slot;
  const isCancelled = event.status !== "active";
  const names = event.participant_names ?? [];
  const shown = names.slice(0, 5);
  const extra = Math.max(0, event.joined_count - shown.length);

  return (
    <Link
      href={`/mabar/${event.id}`}
      prefetch={false}
      className="block rounded-2xl border border-black/10 bg-white p-4 transition hover:border-brand/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-lg font-bold text-ink">{event.title}</p>
            {event.is_private && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                🔒 Privat
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink/60">
            Admin: {event.creator_name || "-"}
            {typeof event.total_members === "number" && (
              <> · <span className="font-semibold text-ink">{event.total_members} Anggota</span></>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {showCompletionBadge ? (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                isCancelled
                  ? "bg-red-100 text-red-600"
                  : "bg-neutral-100 text-ink/60"
              }`}
            >
              {isCancelled ? "Batal" : "Selesai"}
            </span>
          ) : (
            isCancelled && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-ink/60">
                Ditutup
              </span>
            )
          )}
          {event.my_status === "joined" && (
            <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-dark">
              Kamu ikut
            </span>
          )}
          {event.my_status === "waitlist" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
              Waitlist
            </span>
          )}
          {event.my_status === "pending" && (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
              Menunggu approval
            </span>
          )}
        </div>
      </div>

      {(event.level_min || event.gender_restriction) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {event.level_min && event.level_max && (
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-ink/60">
              {levelRangeLabel(event.level_min, event.level_max)}
            </span>
          )}
          {event.gender_restriction && (
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-ink/60">
              {event.gender_restriction === "pria" ? "Man Only" : "Woman Only"}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 space-y-1.5 rounded-xl bg-neutral-50 p-3">
        <p className="flex items-center gap-2 text-sm text-ink/80">
          <span>🕐</span>
          {formatDate(event.event_date)} <span>•</span>{" "}
          <span className="font-semibold text-ink">
            {event.start_time?.slice(0, 5)}
            {event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ""} WIB
          </span>
        </p>
        {event.location && (
          <p className="flex items-center gap-2 text-sm text-ink/80">
            <span>📍</span> {event.location}
          </p>
        )}
        <p className="flex items-center gap-2 text-sm font-bold text-brand-dark">
          <span>🎫</span> {formatRupiah(event.price)}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {shown.map((name, i) => (
              <div
                key={i}
                title={name ?? undefined}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold ${
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                }`}
              >
                {initials(name)}
              </div>
            ))}
            {extra > 0 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-[10px] font-semibold text-ink/50">
                +{extra}
              </div>
            )}
          </div>
          <span className="text-xs text-ink/50">
            {event.joined_count}/{event.max_slot} slot terisi
            {full && event.status === "active" ? " · Penuh" : ""}
          </span>
        </div>

        <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-ink">
          Lihat Detail ›
        </span>
      </div>
    </Link>
  );
}
