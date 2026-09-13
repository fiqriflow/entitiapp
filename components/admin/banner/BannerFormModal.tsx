"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBanner, updateBannerMeta, type BannerInput } from "@/app/admin/banner/actions";

export type BannerRow = {
  id: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  purpose?: "beranda" | "mabar_detail";
};

const EMPTY_BASE = {
  link_url: "",
  is_active: true,
  sort_order: 0,
};

export default function BannerFormModal({
  open,
  onClose,
  editing,
  purpose,
}: {
  open: boolean;
  onClose: () => void;
  editing: BannerRow | null;
  purpose: "beranda" | "mabar_detail";
}) {
  if (!open) return null;

  // key berubah tiap ganti record -> form remount dgn state awal yang benar,
  // tanpa effect sync setState.
  return (
    <BannerFormModalInner
      key={editing?.id ?? "new"}
      onClose={onClose}
      editing={editing}
      purpose={purpose}
    />
  );
}

function BannerFormModalInner({
  onClose,
  editing,
  purpose,
}: {
  onClose: () => void;
  editing: BannerRow | null;
  purpose: "beranda" | "mabar_detail";
}) {
  const [form, setForm] = useState<BannerInput>(() =>
    editing
      ? {
          link_url: editing.link_url ?? "",
          is_active: editing.is_active,
          sort_order: editing.sort_order,
          purpose,
        }
      : { ...EMPTY_BASE, purpose }
  );
  const [preview, setPreview] = useState<string | null>(
    editing?.image_url ?? null
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 4MB.");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editing && !file) {
      setError("Pilih gambar banner dulu.");
      return;
    }

    setLoading(true);

    let imageUrl = editing?.image_url ?? "";

    if (file) {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(path, file);

      if (uploadError) {
        setError("Gagal upload: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("banners")
        .getPublicUrl(path);
      imageUrl = publicUrlData.publicUrl;
    }

    const result = editing
      ? await updateBannerMeta(editing.id, form)
      : await createBanner(imageUrl, form);

    // Kalau ganti gambar pas edit, image_url perlu diupdate juga
    if (editing && file && !result.error) {
      const supabase = createClient();
      await supabase
        .from("hero_banners")
        .update({ image_url: imageUrl })
        .eq("id", editing.id);
    }

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
          {editing ? "Edit Banner" : "Tambah Banner"}
        </h2>
        <p className="mt-1 text-xs text-ink/50">
          Rekomendasi ukuran gambar: <b>1200 × 480 px</b> (rasio 2.5:1),
          format JPG/PNG, maks 4MB. Gambar akan otomatis di-crop rapi
          (object-cover) kalau rasionya beda.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Gambar Banner
            </span>
            <div
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[2.5/1] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-black/15 bg-neutral-50"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-ink/40">
                  Klik untuk pilih gambar
                </span>
              )}
            </div>
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

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Link tujuan (opsional)
            </span>
            <input
              value={form.link_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, link_url: e.target.value }))
              }
              className="input"
              placeholder="/mabar atau https://..."
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Urutan tampil (angka kecil = duluan)
            </span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sort_order: Number(e.target.value),
                }))
              }
              className="input"
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
