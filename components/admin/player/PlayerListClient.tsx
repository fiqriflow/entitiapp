"use client";

import { useState } from "react";
import { deletePlayer } from "@/app/admin/player/actions";
import { LEVEL_LABEL } from "@/lib/constants";
import PlayerFormModal, { type PlayerRow } from "./PlayerFormModal";

export default function PlayerListClient({
  players,
}: {
  players: PlayerRow[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, panggilan, atau email..."
          className="input sm:max-w-xs"
        />
        <button
          onClick={openCreate}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white"
        >
          + Tambah Pemain
        </button>
      </div>

      {/* Mobile: card list */}
      <div className="mt-4 space-y-2 sm:hidden">
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
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/40">
            Belum ada pemain.
          </p>
        )}
      </div>

      {/* Desktop: table */}
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-black/10 bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-medium text-ink/50">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{p.full_name || "-"}</p>
                  <p className="text-xs text-ink/50">{p.nickname}</p>
                </td>
                <td className="px-4 py-3 text-ink/70">{p.email || "-"}</td>
                <td className="px-4 py-3 text-ink/70">
                  {LEVEL_LABEL[p.level ?? ""] ?? "-"}
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {p.gender === "pria" ? "Pria" : p.gender === "wanita" ? "Wanita" : "-"}
                </td>
                <td className="px-4 py-3">
                  {p.role === "admin" ? (
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs text-ink/40">Member</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(p)}
                    className="mr-2 text-xs font-medium text-brand-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-xs font-medium text-red-600"
                  >
                    {deletingId === p.id ? "..." : "Hapus"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/40">
                  Belum ada pemain.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PlayerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
      />
    </div>
  );
}
