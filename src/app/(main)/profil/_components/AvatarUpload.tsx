"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateMyAvatar } from "../actions";

export default function AvatarUpload({
  userId,
  currentUrl,
  displayName,
  presetAvatars,
}: {
  userId: string;
  currentUrl: string | null;
  displayName: string;
  presetAvatars: string[];
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<"avatar" | "upload">("avatar");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 3MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Gagal upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    // Tambahkan cache-buster supaya gambar baru langsung tampil
    const urlWithBuster = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const result = await updateMyAvatar(urlWithBuster);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setPreview(urlWithBuster);
    setPickerOpen(false);
    router.refresh();
  };

  const handlePickPreset = async (url: string) => {
    setError(null);
    setUploading(true);
    const result = await updateMyAvatar(url);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setPreview(url);
    setPickerOpen(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {preview ? (
          <Image
            src={preview}
            alt={displayName}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-200 text-2xl font-semibold text-ink/50">
            {displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <button
          onClick={() => setPickerOpen(true)}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm text-white shadow-sm disabled:opacity-60"
          aria-label="Ganti foto"
        >
          {uploading ? "…" : "✏️"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {pickerOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 md:items-center"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-ink">Foto Profil</h2>

            <div className="mt-3 flex gap-1 rounded-xl bg-neutral-100 p-1">
              <button
                onClick={() => setMode("avatar")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  mode === "avatar"
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink/50"
                }`}
              >
                Pilih Avatar
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  mode === "upload"
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink/50"
                }`}
              >
                Upload Foto
              </button>
            </div>

            {mode === "avatar" ? (
              <div className="mt-4 grid grid-cols-5 gap-2.5">
                {presetAvatars.map((url) => (
                  <button
                    key={url}
                    onClick={() => handlePickPreset(url)}
                    disabled={uploading}
                    className={`overflow-hidden rounded-full border-2 transition disabled:opacity-50 ${
                      preview === url
                        ? "border-brand"
                        : "border-transparent hover:border-brand/40"
                    }`}
                  >
                    <Image
                      src={url}
                      alt=""
                      width={48}
                      height={48}
                      className="h-full w-full"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-ink/50">
                  Format JPG/PNG, maksimal 3MB. Foto akan otomatis dipotong
                  bulat.
                </p>
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="mt-3 w-full rounded-xl border-2 border-dashed border-black/15 py-6 text-sm font-medium text-ink/50 disabled:opacity-50"
                >
                  {uploading ? "Mengunggah..." : "📷 Pilih dari galeri"}
                </button>
              </div>
            )}

            <button
              onClick={() => setPickerOpen(false)}
              className="mt-5 w-full rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
