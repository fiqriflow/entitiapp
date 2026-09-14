import Link from "next/link";

export default function MenuRow({
  href,
  icon,
  label,
  danger,
}: {
  href: string;
  icon: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex items-center gap-3 border-b border-black/5 px-4 py-3.5 last:border-b-0 hover:bg-black/[0.02]"
    >
      <span className="text-lg">{icon}</span>
      <span
        className={`flex-1 text-sm font-medium ${
          danger ? "text-red-600" : "text-ink"
        }`}
      >
        {label}
      </span>
      {!danger && <span className="text-ink/30">›</span>}
    </Link>
  );
}
