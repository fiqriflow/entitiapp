import Link from "next/link";

export default function TentangPage() {
  return (
    <div>
      <Link
        href="/profil"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50"
      >
        ← Kembali
      </Link>

      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
          EB
        </div>
        <h1 className="mt-3 text-xl font-semibold text-ink">
          Entiti Badminton Ciamis
        </h1>
        <p className="mt-1 text-sm text-ink/50">Komunitas badminton Ciamis</p>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-black/10 bg-white p-5 text-sm leading-relaxed text-ink/70">
        <p>
          Entiti Badminton Ciamis adalah komunitas pemain badminton di Ciamis
          yang rutin mengadakan mabar (main bareng) untuk semua level, dari
          pemula sampai mahir. Kami percaya badminton bukan cuma soal
          olahraga, tapi juga soal silaturahmi dan menjaga tubuh tetap
          sehat bareng-bareng.
        </p>
        <p>
          Lewat aplikasi ini, anggota komunitas bisa lihat jadwal mabar
          terbaru, langsung join dari HP, sampai kelola data diri sendiri
          tanpa ribet koordinasi manual di grup WhatsApp.
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-ink/30">
        Punya pertanyaan atau masukan? Hubungi admin komunitas ya.
      </p>
    </div>
  );
}
