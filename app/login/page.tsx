"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { nicknameToEmail } from "@/lib/constants";

export default function LoginPage() {
  const [mode, setMode] = useState<"google" | "nickname">("google");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Gagal masuk dengan Google. Coba lagi ya.");
      setLoading(false);
    }
  };

  const handleNicknameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: nicknameToEmail(nickname),
      password,
    });

    setLoading(false);

    if (error) {
      setError("Nickname atau password salah.");
      return;
    }
    router.push("/beranda");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
            EB
          </div>
          <h1 className="text-xl font-semibold text-ink">
            Entiti Badminton Ciamis
          </h1>
          <p className="text-sm text-ink/60">
            Masuk untuk lihat jadwal mabar & gabung komunitas.
          </p>
        </div>

        <div className="mb-5 flex gap-1 rounded-xl bg-neutral-100 p-1">
          <button
            onClick={() => {
              setMode("google");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "google" ? "bg-white text-ink shadow-sm" : "text-ink/50"
            }`}
          >
            Google
          </button>
          <button
            onClick={() => {
              setMode("nickname");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "nickname"
                ? "bg-white text-ink shadow-sm"
                : "text-ink/50"
            }`}
          >
            Nickname
          </button>
        </div>

        {mode === "google" ? (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-black/5 disabled:opacity-60"
          >
            <GoogleIcon />
            {loading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
          </button>
        ) : (
          <form onSubmit={handleNicknameLogin} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">
                Nickname
              </span>
              <input
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input"
                placeholder="nickname kamu"
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
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <p className="mt-6 text-center text-sm text-ink/50">
          Belum punya akun?{" "}
          <Link href="/signup" className="font-medium text-brand-dark">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
