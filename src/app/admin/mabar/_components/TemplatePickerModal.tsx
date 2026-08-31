"use client";

import { useState } from "react";
import { deleteTemplate } from "../template-actions";
import { formatRupiah, levelRangeLabel } from "@/lib/constants";
import type { MabarInput } from "../actions";

export type TemplateRow = {
  id: string;
  name: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  max_slot: number;
  price: number;
  is_private: boolean;
  level_min: string;
  level_max: string;
  gender_restriction: "pria" | "wanita" | null;
};

export default function TemplatePickerModal({
  open,
  onClose,
  templates,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  templates: TemplateRow[];
  onPick: (prefill: Partial<MabarInput>) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!open) return null;

  const handlePick = (t: TemplateRow) => {
    onPick({
      title: t.title,
      description: t.description ?? "",
      location: t.location ?? "",
      start_time: t.start_time?.slice(0, 5) ?? "",
      end_time: t.end_time?.slice(0, 5) ?? "",
      max_slot: t.max_slot,
      price: t.price,
      is_private: t.is_private,
      level_min: t.level_min,
      level_max: t.level_max,
      gender_restriction: t.gender_restriction ?? "",
      status: "active",
    });
    onClose();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus template ini?")) return;
    setDeletingId(id);
    await deleteTemplate(id);
    setDeletingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 md:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-ink">Pakai Template</h2>
        <p className="mt-1 text-xs text-ink/50">
          Pilih template, nanti tinggal atur tanggalnya aja.
        </p>

        <div className="mt-4 space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-black/10 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink/50">{t.title}</p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="shrink-0 text-[11px] text-red-500 disabled:opacity-50"
                >
                  {deletingId === t.id ? "..." : "Hapus"}
                </button>
              </div>
              <p className="mt-1 text-xs text-ink/50">
                {t.start_time?.slice(0, 5)}
                {t.end_time ? `–${t.end_time.slice(0, 5)}` : ""}
                {t.location ? ` · 📍 ${t.location}` : ""} ·{" "}
                {formatRupiah(t.price)}
              </p>
              <p className="mt-0.5 text-xs text-ink/40">
                {levelRangeLabel(t.level_min, t.level_max)}
                {t.gender_restriction
                  ? ` · ${t.gender_restriction === "pria" ? "Man Only" : "Woman Only"}`
                  : ""}
                {t.is_private ? " · 🔒 Privat" : ""}
              </p>
              <button
                onClick={() => handlePick(t)}
                className="mt-2 w-full rounded-lg bg-brand py-1.5 text-xs font-medium text-white"
              >
                Pakai Template Ini
              </button>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="py-6 text-center text-sm text-ink/40">
              Belum ada template. Simpan salah satu mabar sebagai template
              dulu (tombol &quot;💾 Simpan sbg Template&quot; di tiap card).
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
