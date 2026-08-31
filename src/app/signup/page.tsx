"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { nicknameToEmail } from "@/lib/constants";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nickname.trim().length < 3) {
      setError("Nickname minimal 3 karakter.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: nicknameToEmail(nickname),
      password,
      options: {
        data: {
          nickname: nickname.trim(),
          full_name: fullName.trim() || null,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already")) {
        setError("Nickname ini sudah dipakai. Coba nickname lain, atau login kalau ini akun kamu.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (!data.session) {
      setError(
        "Akun berhasil dibuat, tapi belum bisa langsung masuk. Hubungi admin komunitas ya."
      );
      return;
    }

    router.push("/beranda");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-6 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
            EB
          </div>
          <h1 className="text-xl font-semibold text-ink">Daftar Akun</h1>
          <p className="text-sm text-ink/60">
            Buat akun pakai nickname & password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Nama Lengkap (opsional)
            </span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="Nama kamu"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Nickname
            </span>
            <input
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input"
              placeholder="nickname unik"
              autoCapitalize="none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Minimal 6 karakter"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Konfirmasi Password
            </span>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/50">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-brand-dark">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
