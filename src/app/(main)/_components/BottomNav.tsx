"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/beranda", label: "Beranda", icon: "🏠" },
  { href: "/game", label: "Game", icon: "🏸" },
  { href: "/mabar", label: "Mabar", icon: "📋" },
  { href: "/profil", label: "Profil", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-black/10 bg-white/95 backdrop-blur md:hidden">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
              active ? "text-brand-dark" : "text-ink/45"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
