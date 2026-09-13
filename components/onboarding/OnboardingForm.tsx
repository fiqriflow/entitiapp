"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyProfile, type ProfileInput } from "@/app/(main)/profil/actions";
import { LEVEL_OPTIONS } from "@/lib/constants";

export default function OnboardingForm({ initial }: { initial: ProfileInput }) {
  const [form, setForm] = useState<ProfileInput>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const field = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.gender) {
      setError("Gender wajib dipilih.");
      return;
    }

    setLoading(true);
    const result = await updateMyProfile(form);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/beranda");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
          required
          value={form.nickname}
          onChange={(e) => field("nickname", e.target.value)}
          className="input"
          placeholder="nickname kamu"
          autoCapitalize="none"
        />
      </Field>

      <Field label="No. WhatsApp">
        <input
          required
          value={form.whatsapp}
          onChange={(e) => field("whatsapp", e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Level">
          <select
            required
            value={form.level}
            onChange={(e) => field("level", e.target.value as ProfileInput["level"])}
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
            required
            value={form.gender}
            onChange={(e) => field("gender", e.target.value as ProfileInput["gender"])}
            className="input"
          >
            <option value="" disabled>
              Pilih
            </option>
            <option value="pria">Pria</option>
            <option value="wanita">Wanita</option>
          </select>
        </Field>
      </div>

      <Field label="Instagram">
        <input
          required
          value={form.instagram}
          onChange={(e) => field("instagram", e.target.value)}
          placeholder="@username"
          className="input"
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan & Lanjut"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      {children}
    </label>
  );
}
