"use client";

import { useState } from "react";
import { deletePlayer, hardDeletePlayer } from "@/app/admin/player/actions";
import { LEVEL_LABEL } from "@/lib/constants";
import PlayerFormModal, { type PlayerRow } from "./PlayerFormModal";
import PlayerDetailModal from "./PlayerDetailModal";

export default function PlayerListClient({
  players,
  currentUserId,
}: {
  players: PlayerRow[];
  currentUserId: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerRow | null>(null);
  const [viewing, setViewing] = useState<PlayerRow | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
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
    setMenuOpenId(null);
    setEditing(player);
    setModalOpen(true);
  };

  const openDetail = (player: PlayerRow) => {
    setMenuOpenId(null);
    setViewing(player);
  };

  const handleDelete = async (id: string) => {
    setMenuOpenId(null);
    if (!confirm("Hapus pemain ini? Data tidak bisa dikembalikan.")) return;
    setDeletingId(id);
    await deletePlayer(id);
    setDeletingId(null);
  };

  const handleHardDelete = async (player: PlayerRow) => {
    setMenuOpenId(null);
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

      {/* Table, scroll horizontal di layar sempit */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{p.full_name || "-"}</p>
                  <p className="text-xs text-ink/50">{p.nickname || "-"}</p>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {LEVEL_LABEL[p.level ?? ""] ?? "-"}
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {p.gender === "pria" ? "Pria" : p.gender === "wanita" ? "Wanita" : "-"}
                </td>
                <td className="px-4 py-3">
                  {p.role === "admin" ? (
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand-dark">
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs text-ink/50">Member</span>
                  )}
                </td>
                <td className="relative px-4 py-3 text-right">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                    className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink/70"
                  >
                    Aksi ▾
                  </button>

                  {menuOpenId === p.id && (
                    <>
                      {/* backdrop buat nutup menu kalau klik di luar */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-4 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg">
                        <button
                          onClick={() => openDetail(p)}
                          className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-black/5"
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-black/5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          {deletingId === p.id ? "Menghapus..." : "Hapus"}
                        </button>
                        <button
                          onClick={() => handleHardDelete(p)}
                          disabled={hardDeletingId === p.id}
                          className="block w-full border-t border-black/5 px-4 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          {hardDeletingId === p.id
                            ? "Menghapus permanen..."
                            : "Hapus Permanen"}
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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

      {viewing && (
        <PlayerDetailModal player={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
