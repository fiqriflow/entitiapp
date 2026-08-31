import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminMobileNav from "./_components/AdminMobileNav";
import AdminSidebarNav from "./_components/AdminSidebarNav";
import type { AdminNavItem } from "./_components/nav-types";

const NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/player", label: "Player", icon: "👤" },
  { href: "/admin/mabar", label: "Mabar Event", icon: "🏸" },
  {
    href: "/admin/appearance",
    label: "Appearance",
    icon: "🎨",
    children: [
      { href: "/admin/banner", label: "Banner", icon: "🖼️" },
      { href: "/admin/avatar", label: "Avatar", icon: "😀" },
      { href: "/admin/komitmen", label: "Komitmen", icon: "✅" },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: player } = await supabase
    .from("players")
    .select("role, full_name, nickname")
    .eq("auth_user_id", user.id)
    .single();

  if (player?.role !== "admin") redirect("/beranda");

  const displayName = player?.nickname || player?.full_name || user.email;

  return (
    <div className="min-h-screen bg-neutral-50 md:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-black/10 bg-white md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b border-black/10 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            EB
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Admin Panel</p>
            <p className="text-xs text-ink/50">Entiti Badminton Ciamis</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <AdminSidebarNav items={NAV_ITEMS} />
        </nav>

        <div className="border-t border-black/10 p-3">
          <p className="truncate px-3 text-xs text-ink/50">{displayName}</p>
          <Link
            href="/beranda"
            className="mt-2 block rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-black/5"
          >
            ← Kembali ke app
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Topbar — mobile */}
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            EB
          </div>
          <p className="text-sm font-semibold text-ink">Admin Panel</p>
        </div>
        <Link href="/beranda" className="text-xs font-medium text-brand-dark">
          Kembali ke app
        </Link>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      <AdminMobileNav items={NAV_ITEMS} />
    </div>
  );
}
