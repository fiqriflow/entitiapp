"use client";

import Image from "next/image";
import { useState } from "react";
import { deleteBanner, toggleBannerActive } from "@/app/admin/banner/actions";
import BannerFormModal, { type BannerRow } from "./BannerFormModal";

export default function BannerListClient({
  banners,
  purpose,
}: {
  banners: BannerRow[];
  purpose: "beranda" | "mabar_detail";
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (b: BannerRow) => {
    setEditing(b);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    setBusyId(id);
    await deleteBanner(id);
    setBusyId(null);
  };

  const handleToggle = async (b: BannerRow) => {
    setBusyId(b.id);
    await toggleBannerActive(b.id, !b.is_active);
    setBusyId(null);
  };

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white"
        >
          + Tambah Banner
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {banners.map((b) => (
          <div
            key={b.id}
            className="overflow-hidden rounded-xl border border-black/10 bg-white"
          >
            <div className="relative aspect-[2.5/1] w-full bg-neutral-100">
              <Image
                src={b.image_url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink/50">
                  Urutan: {b.sort_order}
                </span>
                <button
                  onClick={() => handleToggle(b)}
                  disabled={busyId === b.id}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium disabled:opacity-60 ${
                    b.is_active
                      ? "bg-brand-light text-brand-dark"
                      : "bg-neutral-100 text-ink/50"
                  }`}
                >
                  {b.is_active ? "Aktif" : "Nonaktif"}
                </button>
              </div>
              {b.link_url && (
                <p className="mt-1 truncate text-xs text-ink/50">
                  🔗 {b.link_url}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="flex-1 rounded-lg border border-black/10 py-2 text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={busyId === b.id}
                  className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600"
                >
                  {busyId === b.id ? "..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="col-span-2 py-8 text-center text-sm text-ink/40">
            Belum ada banner. Klik &quot;Tambah Banner&quot; untuk mulai.
          </p>
        )}
      </div>

      <BannerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        purpose={purpose}
      />
    </div>
  );
}
