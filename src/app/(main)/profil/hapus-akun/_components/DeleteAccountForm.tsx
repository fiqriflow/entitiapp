"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountForm({ nickname }: { nickname: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [typedNickname, setTypedNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const matches = typedNickname.trim() === nickname.trim() && nickname.trim() !== "";

  const handleDelete = async () => {
    if (!matches) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc("delete_own_account");

    if (rpcError) {
      setError("Gagal menghapus akun: " + rpcError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (step === 1) {
    return (
      <div className="mt-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Menghapus akun akan:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700/90">
            <li>Menghapus permanen data pribadi kamu (nama, foto, WA, Instagram, email)</li>
            <li>Mencabut akses login — kamu tidak bisa masuk lagi pakai akun ini</li>
            <li>
              Riwayat mabar & hasil pertandingan yang kamu ikuti{" "}
              <span className="font-semibold">tetap tersimpan</span>{" "}
              (supaya histori pemain lain yang pernah main bareng kamu tidak
              rusak), tapi namamu akan tampil sebagai &quot;Pemain
              Terhapus&quot;
            </li>
          </ul>
          <p className="mt-3 text-sm text-red-700/90">
            Data pribadi ini tidak bisa dikembalikan setelah dihapus.
          </p>
        </div>

        <button
          onClick={() => setStep(2)}
          className="mt-4 w-full rounded-xl border border-red-300 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Saya Mengerti, Lanjutkan
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">
          Buat konfirmasi terakhir, ketik nickname kamu persis seperti ini:
        </p>
        <p className="mt-1 text-sm font-bold text-red-700">{nickname || "-"}</p>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-medium text-ink/60">
          Ketik nickname kamu
        </span>
        <input
          value={typedNickname}
          onChange={(e) => setTypedNickname(e.target.value)}
          className="input"
          placeholder={nickname}
          autoCapitalize="none"
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setStep(1)}
          disabled={loading}
          className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-medium text-ink disabled:opacity-50"
        >
          Batal
        </button>
        <button
          onClick={handleDelete}
          disabled={!matches || loading}
          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {loading ? "Menghapus..." : "Hapus Akun Saya"}
        </button>
      </div>
    </div>
  );
}
