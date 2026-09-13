"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LEVEL_LABEL } from "@/lib/constants";
import { togglePaymentStatus, toggleCheckIn } from "@/app/admin/mabar/actions";

export type ParticipantRow = {
  id: string;
  status: string;
  is_paid?: boolean;
  checked_in?: boolean;
  total_main?: number;
  players: {
    full_name: string | null;
    nickname: string | null;
    level: string | null;
    avatar_url: string | null;
    instagram: string | null;
  } | null;
};

export default function PlayerList({
  title,
  players,
  emptyText,
  showPayment = false,
  showCheckIn = false,
  checkInEnabled = false,
  isAdmin = false,
}: {
  title: string;
  players: ParticipantRow[];
  emptyText: string;
  showPayment?: boolean;
  showCheckIn?: boolean;
  checkInEnabled?: boolean;
  isAdmin?: boolean;
}) {
  const [selected, setSelected] = useState<ParticipantRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const router = useRouter();

  const handleTogglePayment = (e: React.MouseEvent, p: ParticipantRow) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setTogglingId(p.id);
    startTransition(async () => {
      await togglePaymentStatus(p.id, !p.is_paid);
      setTogglingId(null);
      router.refresh();
    });
  };

  const handleToggleCheckIn = (e: React.MouseEvent, p: ParticipantRow) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!checkInEnabled && !p.checked_in) return;
    setTogglingId(p.id);
    startTransition(async () => {
      await toggleCheckIn(p.id, !p.checked_in);
      setTogglingId(null);
      router.refresh();
    });
  };

  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        {title} <span className="text-ink/40">({players.length})</span>
      </p>
      {showCheckIn && isAdmin && !checkInEnabled && (
        <p className="mt-1 text-xs text-ink/40">
          Check-in bisa dilakukan mulai hari-H.
        </p>
      )}
      <div className="mt-2 space-y-1.5">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="flex w-full items-center gap-3 rounded-lg border border-black/5 bg-white px-3 py-2 text-left transition hover:border-brand/30"
          >
            {p.players?.avatar_url ? (
              <Image
                src={p.players.avatar_url}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-ink/50">
                {(p.players?.full_name ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {p.players?.nickname || p.players?.full_name || "Pemain"}
              </p>
              <p className="text-xs text-ink/50">
                {LEVEL_LABEL[p.players?.level ?? ""] ?? "-"}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              {showPayment &&
                (isAdmin ? (
                  <span
                    role="button"
                    onClick={(e) => handleTogglePayment(e, p)}
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                      p.is_paid
                        ? "bg-brand-light text-brand-dark"
                        : "bg-amber-100 text-amber-700"
                    } ${isPending && togglingId === p.id ? "opacity-50" : ""}`}
                  >
                    {isPending && togglingId === p.id
                      ? "..."
                      : p.is_paid
                      ? "💰 Lunas"
                      : "⏳ Belum Bayar"}
                  </span>
                ) : (
                  p.is_paid && (
                    <span className="rounded-full bg-brand-light px-2 py-1 text-[10px] font-medium text-brand-dark">
                      💰 Lunas
                    </span>
                  )
                ))}

              {showCheckIn &&
                (isAdmin ? (
                  <span
                    role="button"
                    onClick={(e) => handleToggleCheckIn(e, p)}
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                      p.checked_in
                        ? "bg-brand-light text-brand-dark"
                        : checkInEnabled
                        ? "bg-neutral-100 text-ink/50"
                        : "bg-neutral-100 text-ink/30"
                    } ${isPending && togglingId === p.id ? "opacity-50" : ""}`}
                  >
                    {isPending && togglingId === p.id
                      ? "..."
                      : p.checked_in
                      ? "✅ Hadir"
                      : "⬜ Belum Hadir"}
                  </span>
                ) : (
                  p.checked_in && (
                    <span className="rounded-full bg-brand-light px-2 py-1 text-[10px] font-medium text-brand-dark">
                      ✅ Hadir
                    </span>
                  )
                ))}
            </div>
          </button>
        ))}
        {players.length === 0 && (
          <p className="rounded-lg border border-dashed border-black/10 bg-white px-3 py-4 text-center text-xs text-ink/40">
            {emptyText}
          </p>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 md:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-6 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              {selected.players?.avatar_url ? (
                <Image
                  src={selected.players.avatar_url}
                  alt=""
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-2xl font-semibold text-ink/50">
                  {(selected.players?.full_name ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <p className="mt-3 text-base font-semibold text-ink">
                {selected.players?.nickname || selected.players?.full_name || "Pemain"}
              </p>
              {selected.players?.nickname && selected.players?.full_name && (
                <p className="text-xs text-ink/50">
                  {selected.players.full_name}
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
                <span className="text-xs text-ink/50">Level</span>
                <span className="text-sm font-medium text-ink">
                  {LEVEL_LABEL[selected.players?.level ?? ""] ?? "-"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
                <span className="text-xs text-ink/50">Instagram</span>
                <span className="text-sm font-medium text-ink">
                  {selected.players?.instagram ? (
                    <a
                      href={`https://instagram.com/${selected.players.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-dark"
                    >
                      {selected.players.instagram}
                    </a>
                  ) : (
                    "-"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
                <span className="text-xs text-ink/50">Total Main</span>
                <span className="text-sm font-medium text-ink">
                  {selected.total_main ?? 0}x mabar
                </span>
              </div>
              {showPayment && selected.status === "joined" && (
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
                  <span className="text-xs text-ink/50">Status Bayar</span>
                  <span
                    className={`text-sm font-medium ${
                      selected.is_paid ? "text-brand-dark" : "text-amber-700"
                    }`}
                  >
                    {selected.is_paid ? "💰 Lunas" : "⏳ Belum Bayar"}
                  </span>
                </div>
              )}
              {showCheckIn && selected.status === "joined" && (
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
                  <span className="text-xs text-ink/50">Kehadiran</span>
                  <span
                    className={`text-sm font-medium ${
                      selected.checked_in ? "text-brand-dark" : "text-ink/50"
                    }`}
                  >
                    {selected.checked_in ? "✅ Hadir" : "⬜ Belum Hadir"}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
