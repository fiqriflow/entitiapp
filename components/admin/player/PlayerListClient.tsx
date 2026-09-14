"use client";

import { useState } from "react";
import { deletePlayer, hardDeletePlayer } from "@/app/admin/player/actions";
import { LEVEL_LABEL } from "@/lib/constants";
import PlayerFormModal, { type PlayerRow } from "./PlayerFormModal";

export default function PlayerListClient({
  players,
  currentUserId,
}: {
  players: PlayerRow[];
  currentUserId: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hardDeletingId, setHardDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = players.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.nickname?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (player: PlayerRow) => {
    setEditing(player);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pemain ini? Data tidak bisa dikembalikan.")) return;
    setDeletingId(id);
    await deletePlayer(id);
    setDeletingId(null);
  };

  const handleHardDelete = async (player: PlayerRow) => {
    if (player.auth_user_id && player.auth_user_id === currentUserId) {
      alert("Kamu tidak bisa menghapus akunmu sendiri.");
      return;
    }
    if (
      !confirm(
        `HAPUS PERMANEN "${player.full_name || player.nickname || player.id}"?\n\n` +
          "Ini menghapus data pemain DAN akun Google-nya sekaligus (kalau ada). " +
          "Emailnya akan benar-benar bersih, seolah belum pernah daftar. " +
          "AKSI INI TIDAK BISA DIBATALKAN."
      )
    )
      return;
    const confirmText = prompt('Ketik "HAPUS" untuk konfirmasi hapus permanen:');
    if (confirmText !== "HAPUS") {
      if (confirmText !== null) alert("Konfirmasi tidak sesuai, dibatalkan.");
      return;
    }
    setHardDeletingId(player.id);
    const result = await hardDeletePlayer(player.id);
    setHardDeletingId(null);
    if (result.error) {
      alert("Gagal hapus permanen: " + result.error);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, panggilan, atau email..."
          className="input"
        />
        <button
          onClick={openCreate}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white"
        >
          + Tambah Pemain
        </button>
      </div>

      {/* Card list */}
      <div className="mt-4 space-y-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-black/10 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {p.full_name || "-"}
                </p>
                <p className="text-xs text-ink/50">{p.nickname}</p>
              </div>
              {p.role === "admin" && (
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand-dark">
                  Admin
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-ink/60">
              <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                {LEVEL_LABEL[p.level ?? ""] ?? "-"}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                {p.gender === "pria" ? "Pria" : p.gender === "wanita" ? "Wanita" : "-"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => openEdit(p)}
                className="flex-1 rounded-lg border border-black/10 py-2 text-xs font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600"
              >
                {deletingId === p.id ? "Menghapus..." : "Hapus"}
              </button>
            </div>
            <button
              onClick={() => handleHardDelete(p)}
              disabled={hardDeletingId === p.id}
              className="mt-2 w-full rounded-lg border border-red-300 bg-red-50 py-2 text-xs font-bold text-red-700"
            >
              {hardDeletingId === p.id ? "Menghapus permanen..." : "Hapus Permanen"}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/40">
            Belum ada pemain.
          </p>
        )}
      </div>

      <PlayerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
      />
    </div>
  );
}
