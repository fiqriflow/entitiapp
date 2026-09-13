"use client";

import { useState } from "react";
import {
  createCommitmentItem,
  updateCommitmentItem,
  toggleCommitmentItemActive,
  updateCommitmentItemOrder,
  deleteCommitmentItem,
} from "@/app/admin/komitmen/actions";

export type CommitmentRow = {
  id: string;
  text: string;
  is_active: boolean;
  sort_order: number;
};

export default function KomitmenListClient({
  items,
}: {
  items: CommitmentRow[];
}) {
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    setAdding(true);
    const maxOrder = items.reduce((m, i) => Math.max(m, i.sort_order), -1);
    await createCommitmentItem(newText, maxOrder + 1);
    setNewText("");
    setAdding(false);
  };

  const startEdit = (item: CommitmentRow) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    setBusyId(id);
    await updateCommitmentItem(id, editText);
    setEditingId(null);
    setBusyId(null);
  };

  const handleToggle = async (item: CommitmentRow) => {
    setBusyId(item.id);
    await toggleCommitmentItemActive(item.id, !item.is_active);
    setBusyId(null);
  };

  const handleOrderChange = async (item: CommitmentRow, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    await updateCommitmentItemOrder(item.id, num);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus poin komitmen ini?")) return;
    setBusyId(id);
    await deleteCommitmentItem(id);
    setBusyId(null);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Tulis poin komitmen baru..."
          className="input"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newText.trim()}
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {adding ? "..." : "+ Tambah"}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-black/10 bg-white p-3"
          >
            {editingId === item.id ? (
              <div className="space-y-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="input"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-md border border-black/10 py-1.5 text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => saveEdit(item.id)}
                    disabled={busyId === item.id}
                    className="flex-1 rounded-md bg-brand py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <input
                  type="number"
                  defaultValue={item.sort_order}
                  onBlur={(e) => handleOrderChange(item, e.target.value)}
                  className="w-12 shrink-0 rounded-md border border-black/10 px-1 py-1 text-center text-xs"
                  title="Urutan"
                />
                <p className="flex-1 text-sm text-ink">{item.text}</p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={busyId === item.id}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium disabled:opacity-50 ${
                      item.is_active
                        ? "bg-brand-light text-brand-dark"
                        : "bg-neutral-100 text-ink/50"
                    }`}
                  >
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-[11px] font-medium text-brand-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={busyId === item.id}
                      className="text-[11px] font-medium text-red-600 disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/40">
            Belum ada poin komitmen. Tambah dulu di atas.
          </p>
        )}
      </div>
    </div>
  );
}
