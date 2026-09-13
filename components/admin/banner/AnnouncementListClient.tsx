"use client";

import { useState } from "react";
import { deleteAnnouncement, toggleAnnouncementActive } from "@/app/admin/banner/pengumuman-actions";
import AnnouncementFormModal, {
  type AnnouncementRow,
} from "./AnnouncementFormModal";

export default function AnnouncementListClient({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (a: AnnouncementRow) => {
    setEditing(a);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    setBusyId(id);
    await deleteAnnouncement(id);
    setBusyId(null);
  };

  const handleToggle = async (a: AnnouncementRow) => {
    setBusyId(a.id);
    await toggleAnnouncementActive(a.id, !a.is_active);
    setBusyId(null);
  };

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white"
        >
          + Buat Pengumuman
        </button>
      </div>

      <div className="mt-4 space-y-2.5">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-black/10 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{a.title}</p>
                {a.content && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink/60">
                    {a.content}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleToggle(a)}
                disabled={busyId === a.id}
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium disabled:opacity-60 ${
                  a.is_active
                    ? "bg-brand-light text-brand-dark"
                    : "bg-neutral-100 text-ink/50"
                }`}
              >
                {a.is_active ? "Aktif" : "Nonaktif"}
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => openEdit(a)}
                className="flex-1 rounded-lg border border-black/10 py-2 text-xs font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                disabled={busyId === a.id}
                className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600"
              >
                {busyId === a.id ? "Memproses..." : "Hapus"}
              </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/40">
            Belum ada pengumuman. Klik &quot;Buat Pengumuman&quot; untuk mulai.
          </p>
        )}
      </div>

      <AnnouncementFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
      />
    </div>
  );
}
