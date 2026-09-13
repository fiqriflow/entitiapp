import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-lg font-semibold text-ink">Gagal masuk</h1>
      <p className="text-sm text-ink/60">
        Terjadi kesalahan saat proses login. Coba masuk lagi.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
      >
        Kembali ke halaman login
      </Link>
    </main>
  );
}
