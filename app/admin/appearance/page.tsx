import Link from "next/link";

export const dynamic = "force-dynamic";

const APPEARANCE_ITEMS = [
  {
    href: "/admin/banner",
    icon: "🖼️",
    label: "Banner",
    desc: "Kelola hero banner, header mabar, dan pengumuman.",
  },
  {
    href: "/admin/avatar",
    icon: "😀",
    label: "Avatar",
    desc: "Kelola pilihan avatar preset yang bisa dipakai pemain.",
  },
  {
    href: "/admin/komitmen",
    icon: "✅",
    label: "Komitmen",
    desc: "Kelola checklist komitmen sebelum pemain join mabar.",
  },
];

export default function AdminAppearancePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Appearance</h1>
      <p className="mt-1 text-sm text-ink/60">
        Kelola tampilan konten yang dilihat pemain di aplikasi.
      </p>

      <div className="mt-6 grid gap-3">
        {APPEARANCE_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-black/10 bg-white p-4 transition hover:border-brand hover:shadow-sm"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="mt-2 text-sm font-semibold text-ink">{item.label}</p>
            <p className="mt-1 text-xs text-ink/60">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
