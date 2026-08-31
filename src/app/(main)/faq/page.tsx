import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "Apa itu Mabar?",
    a: "Mabar artinya main bareng — jadwal latihan/bermain badminton bareng anggota komunitas yang bisa kamu lihat dan ikuti lewat menu Mabar.",
  },
  {
    q: "Bagaimana cara join Mabar?",
    a: 'Buka menu Mabar, pilih jadwal yang aktif, lalu tekan tombol "Join Mabar" di halaman detailnya. Kalau slotnya penuh, kamu otomatis masuk waitlist.',
  },
  {
    q: "Apa bedanya Mabar Umum dan Mabar Privat?",
    a: "Mabar Umum bisa langsung diikuti siapa saja. Mabar Privat butuh persetujuan admin dulu sebelum kamu resmi jadi peserta — status kamu akan tertulis \"Menunggu approval\".",
  },
  {
    q: "Saya di waitlist, terus gimana?",
    a: "Kalau ada peserta yang batal, sistem otomatis mempromosikan orang di waitlist paling awal jadi peserta tetap, dan kamu akan dapat notifikasi.",
  },
  {
    q: "Bagaimana cara update data diri atau level saya?",
    a: 'Buka menu Profil → Data Pemain, lalu edit informasi kamu (nama, WhatsApp, level, gender, Instagram) dan tekan "Simpan Perubahan".',
  },
  {
    q: "Mabar-nya berbayar atau gratis?",
    a: 'Tergantung event-nya. Harga (kalau ada) selalu ditampilkan di card dan halaman detail mabar — kalau tertulis "Gratis" berarti tidak dipungut biaya.',
  },
  {
    q: "Kenapa notifikasi saya tidak muncul?",
    a: "Notifikasi muncul di ikon 🔔 pada bagian atas layar. Pastikan kamu login dan sudah melengkapi data pemain supaya sistem bisa mengenali akun kamu.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <Link
        href="/profil"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50"
      >
        ← Kembali
      </Link>

      <h1 className="text-xl font-semibold text-ink">FAQ</h1>
      <p className="mt-1 text-sm text-ink/60">
        Pertanyaan yang sering ditanyakan seputar aplikasi.
      </p>

      <div className="mt-6 space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={i}
            className="group rounded-xl border border-black/10 bg-white p-4 open:pb-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
              {item.q}
              <span className="ml-2 shrink-0 text-ink/30 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm text-ink/60">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
