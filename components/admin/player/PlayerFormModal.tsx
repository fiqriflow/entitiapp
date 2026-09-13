"use client";

import { useState } from "react";
import { createPlayer, updatePlayer, type PlayerInput } from "@/app/admin/player/actions";
import { LEVEL_OPTIONS } from "@/lib/constants";

export type PlayerRow = {
  id: string;
  full_name: string | null;
  nickname: string | null;
  email: string | null;
  whatsapp: string | null;
  level: string | null;
  gender: string | null;
  instagram: string | null;
  role: string;
};

const EMPTY: PlayerInput = {
  full_name: "",
  nickname: "",
  email: "",
  whatsapp: "",
  level: "newbie",
  gender: "",
  instagram: "",
  role: "member",
};

export default function PlayerFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: PlayerRow | null;
}) {
  if (!open) return null;

  // key berubah tiap ganti record -> form remount dgn state awal yang benar,
  // tanpa effect sync setState.
  return (
    <PlayerFormModalInner
      key={editing?.id ?? "new"}
      onClose={onClose}
      editing={editing}
    />
  );
}

function PlayerFormModalInner({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing: PlayerRow | null;
}) {
  const [form, setForm] = useState<PlayerInput>(() =>
    editing
      ? {
          full_name: editing.full_name ?? "",
          nickname: editing.nickname ?? "",
          email: editing.email ?? "",
          whatsapp: editing.whatsapp ?? "",
          level: (editing.level as PlayerInput["level"]) ?? "newbie",
          gender: (editing.gender as PlayerInput["gender"]) ?? "",
          instagram: editing.instagram ?? "",
          role: (editing.role as PlayerInput["role"]) ?? "member",
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
      ? await updatePlayer(editing.id, form)
      : await createPlayer(form);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  const field = (key: keyof PlayerInput, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 md:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 md:rounded-2xl">
        <h2 className="text-lg font-semibold text-ink">
          {editing ? "Edit Pemain" : "Tambah Pemain"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Field label="Nama Lengkap">
            <input
              required
              value={form.full_name}
              onChange={(e) => field("full_name", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Nama Panggilan">
            <input
              value={form.nickname}
              onChange={(e) => field("nickname", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Email (untuk link akun Google saat login)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => field("email", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="No. WhatsApp">
            <input
              value={form.whatsapp}
              onChange={(e) => field("whatsapp", e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Level">
              <select
                value={form.level}
                onChange={(e) =>
                  field("level", e.target.value as PlayerInput["level"])
                }
                className="input"
              >
                {LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) =>
                  field("gender", e.target.value as PlayerInput["gender"])
                }
                className="input"
              >
                <option value="">-</option>
                <option value="pria">Pria</option>
                <option value="wanita">Wanita</option>
              </select>
            </Field>
          </div>

          <Field label="Instagram">
            <input
              value={form.instagram}
              onChange={(e) => field("instagram", e.target.value)}
              placeholder="@username"
              className="input"
            />
          </Field>

          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) =>
                field("role", e.target.value as PlayerInput["role"])
              }
              className="input"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

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
