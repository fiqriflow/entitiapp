"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveParticipant, rejectParticipant } from "@/app/admin/mabar/actions";
import type { ParticipantRow } from "./PlayerList";

export default function PendingApprovalList({
  players,
}: {
  players: ParticipantRow[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  if (players.length === 0) return null;

  const handleApprove = async (id: string) => {
    setBusyId(id);
    await approveParticipant(id);
    setBusyId(null);
    router.refresh();
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    await rejectParticipant(id);
    setBusyId(null);
    router.refresh();
  };

  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        Menunggu Persetujuan{" "}
        <span className="text-ink/40">({players.length})</span>
      </p>
      <div className="mt-2 space-y-1.5">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
          >
            <span className="truncate text-sm text-ink">
              {p.players?.nickname || p.players?.full_name || "Pemain"}
            </span>
            <div className="flex shrink-0 gap-1.5">
              <button
                onClick={() => handleApprove(p.id)}
                disabled={busyId === p.id}
                className="rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white disabled:opacity-60"
              >
                Terima
              </button>
              <button
                onClick={() => handleReject(p.id)}
                disabled={busyId === p.id}
                className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 disabled:opacity-60"
              >
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
