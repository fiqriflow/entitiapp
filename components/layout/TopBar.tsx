"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/beranda", label: "Beranda" },
  { href: "/game", label: "Game" },
  { href: "/mabar", label: "Mabar" },
  { href: "/profil", label: "Profil" },
];

export default function TopBar({
  avatarUrl,
  displayName,
  unreadCount,
}: {
  avatarUrl: string | null;
  displayName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/beranda" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            EB
          </div>
          <span className="hidden text-sm font-semibold text-ink sm:block">
            Entiti Badminton Ciamis
          </span>
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand-light text-brand-dark"
                    : "text-ink/60 hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/notifikasi"
            aria-label="Notifikasi"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-black/5"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/profil" className="shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-ink/60">
                {displayName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
