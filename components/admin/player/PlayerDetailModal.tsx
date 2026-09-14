"use client";

import { LEVEL_LABEL } from "@/lib/constants";
import type { PlayerRow } from "./PlayerFormModal";

export default function PlayerDetailModal({
  player,
  onClose,
}: {
  player: PlayerRow;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-ink">Detail Pemain</h2>
          {player.role === "admin" && (
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand-dark">
              Admin
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <Row label="Nama Lengkap" value={player.full_name} />
          <Row label="Nama Panggilan" value={player.nickname} />
          <Row label="Email" value={player.email} />
          <Row label="No. WhatsApp" value={player.whatsapp} />
          <Row
            label="Level"
            value={LEVEL_LABEL[player.level ?? ""] ?? player.level}
          />
          <Row
            label="Gender"
            value={
              player.gender === "pria"
                ? "Pria"
                : player.gender === "wanita"
                ? "Wanita"
                : "-"
            }
          />
          <Row label="Instagram" value={player.instagram} />
          <Row label="Role" value={player.role === "admin" ? "Admin" : "Member"} />
          <Row
            label="Status Akun Google"
            value={player.auth_user_id ? "Sudah link" : "Belum pernah login"}
          />
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-black/10 py-2.5 text-sm font-medium text-ink"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-2 last:border-b-0">
      <span className="text-xs font-medium text-ink/50">{label}</span>
      <span className="text-right text-sm text-ink">{value || "-"}</span>
    </div>
  );
}
