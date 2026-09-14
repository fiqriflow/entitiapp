import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isProfileComplete } from "@/lib/constants";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import type { AdminNavItem } from "@/components/admin/nav-types";

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
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { data: player } = await supabase
    .from("players")
    .select("role, full_name, nickname, whatsapp, gender, instagram")
    .eq("auth_user_id", user.id)
    .single();

  if (player?.role !== "admin") redirect("/beranda");
  if (!isProfileComplete(player)) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Topbar */}
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            EB
          </div>
          <p className="text-sm font-semibold text-ink">Admin Panel</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/beranda" className="text-xs font-medium text-brand-dark">
            Kembali ke app
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs font-medium text-red-600"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <div className="mx-auto max-w-md px-4 py-6">{children}</div>
      </main>

      <AdminMobileNav items={NAV_ITEMS} />
    </div>
  );
}
