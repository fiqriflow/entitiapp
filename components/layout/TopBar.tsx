"use client";

import Image from "next/image";
import Link from "next/link";

export default function TopBar({
  avatarUrl,
  displayName,
  unreadCount,
}: {
  avatarUrl: string | null;
  displayName: string;
  unreadCount: number;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link href="/beranda" prefetch={false} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            EB
          </div>
          <span className="text-sm font-semibold text-ink">
            Entiti Badminton Ciamis
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/notifikasi"
            prefetch={false}
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
          <Link href="/profil" prefetch={false} className="shrink-0">
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
