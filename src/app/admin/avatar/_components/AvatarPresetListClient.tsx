"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createAvatarPreset,
  toggleAvatarPresetActive,
  updateAvatarPresetOrder,
  deleteAvatarPreset,
} from "../actions";

export type AvatarPresetRow = {
  id: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

export default function AvatarPresetListClient({
  presets,
}: {
  presets: AvatarPresetRow[];
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 2MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar-presets")
      .upload(path, file);

    if (uploadError) {
      setError("Gagal upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatar-presets")
      .getPublicUrl(path);

    const maxOrder = presets.reduce((m, p) => Math.max(m, p.sort_order), -1);
    const result = await createAvatarPreset(publicUrlData.publicUrl, maxOrder + 1);
    setUploading(false);

    if (result.error) setError(result.error);
  };

  const handleToggle = async (p: AvatarPresetRow) => {
    setBusyId(p.id);
    await toggleAvatarPresetActive(p.id, !p.is_active);
    setBusyId(null);
  };

  const handleOrderChange = async (p: AvatarPresetRow, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    await updateAvatarPresetOrder(p.id, num);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus avatar preset ini?")) return;
    setBusyId(id);
    await deleteAvatarPreset(id);
    setBusyId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink/50">
          Yang &quot;Aktif&quot; yang muncul jadi pilihan avatar di halaman
          Profil pemain.
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {uploading ? "Mengunggah..." : "+ Tambah Avatar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {[...presets]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-2 text-center ${
                p.is_active ? "border-black/10 bg-white" : "border-black/10 bg-neutral-50 opacity-50"
              }`}
            >
              <Image
                src={p.image_url}
                alt=""
                width={56}
                height={56}
                className="mx-auto h-14 w-14 rounded-full object-cover"
              />
              <input
                type="number"
                defaultValue={p.sort_order}
                onBlur={(e) => handleOrderChange(p, e.target.value)}
                className="mt-2 w-full rounded-md border border-black/10 px-1 py-0.5 text-center text-xs"
                title="Urutan tampil"
              />
              <button
                onClick={() => handleToggle(p)}
                disabled={busyId === p.id}
                className={`mt-1.5 w-full rounded-md px-1 py-1 text-[10px] font-medium disabled:opacity-50 ${
                  p.is_active
                    ? "bg-brand-light text-brand-dark"
                    : "bg-neutral-200 text-ink/50"
                }`}
              >
                {p.is_active ? "Aktif" : "Nonaktif"}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={busyId === p.id}
                className="mt-1 w-full rounded-md border border-red-200 px-1 py-1 text-[10px] font-medium text-red-600 disabled:opacity-50"
              >
                {busyId === p.id ? "..." : "Hapus"}
              </button>
            </div>
          ))}
        {presets.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-ink/40">
            Belum ada avatar preset.
          </p>
        )}
      </div>
    </div>
  );
}
