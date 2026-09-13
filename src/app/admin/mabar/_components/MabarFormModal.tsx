"use client";

import { useState } from "react";
import {
  createMabarEvent,
  updateMabarEvent,
  type MabarInput,
} from "../actions";
import LevelRangeSlider from "./LevelRangeSlider";

export type MabarRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  max_slot: number;
  price: number;
  status: string;
  is_private: boolean;
  completion_override: "selesai" | "belum" | null;
  level_min: string;
  level_max: string;
  gender_restriction: "pria" | "wanita" | null;
  joined_count: number;
  pending_count: number;
  paid_count: number;
  checked_in_count: number;
};

const EMPTY: MabarInput = {
  title: "",
  description: "",
  location: "",
  event_date: "",
  start_time: "",
  end_time: "",
  max_slot: 10,
  price: 0,
  status: "active",
  is_private: false,
  level_min: "newbie",
  level_max: "advance",
  gender_restriction: "",
};

export default function MabarFormModal({
  open,
  onClose,
  editing,
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  editing: MabarRow | null;
  prefill?: Partial<MabarInput> | null;
}) {
  if (!open) return null;

  // key berubah tiap ganti record/prefill -> form remount dgn state awal yang
  // benar, tanpa effect sync setState.
  return (
    <MabarFormModalInner
      key={editing?.id ?? (prefill ? JSON.stringify(prefill) : "new")}
      onClose={onClose}
      editing={editing}
      prefill={prefill}
    />
  );
}

function MabarFormModalInner({
  onClose,
  editing,
  prefill,
}: {
  onClose: () => void;
  editing: MabarRow | null;
  prefill?: Partial<MabarInput> | null;
}) {
  const [form, setForm] = useState<MabarInput>(() => {
    if (editing) {
      return {
        title: editing.title,
        description: editing.description ?? "",
        location: editing.location ?? "",
        event_date: editing.event_date,
        start_time: editing.start_time?.slice(0, 5) ?? "",
        end_time: editing.end_time?.slice(0, 5) ?? "",
        max_slot: editing.max_slot,
        price: editing.price,
        status: (editing.status as MabarInput["status"]) ?? "active",
        is_private: editing.is_private,
        level_min: editing.level_min ?? "newbie",
        level_max: editing.level_max ?? "advance",
        gender_restriction: editing.gender_restriction ?? "",
      };
    }
    if (prefill) {
      return { ...EMPTY, ...prefill, event_date: "" };
    }
    return EMPTY;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = editing
      ? await updateMabarEvent(editing.id, form)
      : await createMabarEvent(form);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  const field = <K extends keyof MabarInput>(key: K, value: MabarInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 md:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 md:rounded-2xl">
        <h2 className="text-lg font-semibold text-ink">
          {editing ? "Edit Mabar" : "Buat Mabar Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Field label="Judul">
            <input
              required
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              className="input"
              placeholder="Mabar Rutin Minggu Pagi"
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              className="input"
              rows={2}
            />
          </Field>

          <Field label="Lokasi">
            <input
              value={form.location}
              onChange={(e) => field("location", e.target.value)}
              className="input"
              placeholder="GOR Sadang, Ciamis"
            />
          </Field>

          <Field label="Tanggal">
            <input
              required
              type="date"
              value={form.event_date}
              onChange={(e) => field("event_date", e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jam Mulai">
              <input
                required
                type="time"
                value={form.start_time}
                onChange={(e) => field("start_time", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Jam Selesai">
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => field("end_time", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Slot">
              <input
                required
                type="number"
                min={1}
                value={form.max_slot}
                onChange={(e) => field("max_slot", Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Harga (Rp)">
              <input
                required
                type="number"
                min={0}
                step={500}
                value={form.price}
                onChange={(e) => field("price", Number(e.target.value))}
                className="input"
                placeholder="0"
              />
              <span className="mt-1 block text-[11px] text-ink/40">
                Isi 0 kalau gratis
              </span>
            </Field>
          </div>

          <div>
            <span className="mb-2 block text-xs font-medium text-ink/60">
              Rentang Level
            </span>
            <LevelRangeSlider
              min={form.level_min}
              max={form.level_max}
              onChange={(min, max) => {
                field("level_min", min);
                field("level_max", max);
              }}
            />
            <span className="mt-2 block text-[11px] text-ink/40">
              Geser dua titiknya ke tempat sama buat batasi ke satu level
              aja.
            </span>
          </div>

          <Field label="Gender">
            <select
              value={form.gender_restriction}
              onChange={(e) =>
                field(
                  "gender_restriction",
                  e.target.value as MabarInput["gender_restriction"]
                )
              }
              className="input"
            >
              <option value="">Semua gender</option>
              <option value="pria">Man Only</option>
              <option value="wanita">Woman Only</option>
            </select>
          </Field>

          <label className="flex items-start gap-2 rounded-lg border border-black/10 p-3">
            <input
              type="checkbox"
              checked={form.is_private}
              onChange={(e) => field("is_private", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-black/20 accent-brand"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                Mabar Privat
              </span>
              <span className="block text-xs text-ink/50">
                Orang yang mau join harus di-approve admin dulu sebelum
                resmi masuk daftar peserta.
              </span>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">
        {label}
      </span>
      {children}
    </label>
  );
}
