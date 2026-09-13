"use client";

import { useState } from "react";
import {
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from "../pengumuman-actions";

export type AnnouncementRow = {
  id: string;
  title: string;
  content: string | null;
  is_active: boolean;
};

const EMPTY: AnnouncementInput = {
  title: "",
  content: "",
  is_active: true,
};

export default function AnnouncementFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: AnnouncementRow | null;
}) {
  if (!open) return null;

  // key berubah tiap kali modal dibuka utk record berbeda -> form otomatis
  // remount dengan state awal yang benar, tanpa perlu effect sync setState.
  return (
    <AnnouncementFormModalInner
      key={editing?.id ?? "new"}
      onClose={onClose}
      editing={editing}
    />
  );
}

function AnnouncementFormModalInner({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing: AnnouncementRow | null;
}) {
  const [form, setForm] = useState<AnnouncementInput>(() =>
    editing
      ? {
          title: editing.title,
          content: editing.content ?? "",
          is_active: editing.is_active,
        }
      : EMPTY
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = editing
      ? await updateAnnouncement(editing.id, form)
      : await createAnnouncement(form);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 md:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 md:rounded-2xl">
        <h2 className="text-lg font-semibold text-ink">
          {editing ? "Edit Pengumuman" : "Buat Pengumuman"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Judul
            </span>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="input"
              placeholder="Libur Mabar Minggu Ini"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Isi
            </span>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              className="input"
              rows={4}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-black/20 accent-brand"
            />
            <span className="text-sm text-ink/70">
              Tampilkan di Beranda (aktif)
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-ink"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
