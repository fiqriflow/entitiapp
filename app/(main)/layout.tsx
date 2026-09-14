import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isProfileComplete } from "@/lib/constants";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // 1 round-trip: ambil data profil + unread count sekaligus (RPC get_me_with_unread)
  const { data: rows } = await supabase.rpc("get_me_with_unread", {
    p_auth_user_id: user.id,
  });
  let me = rows?.[0] ?? null;
  let unreadCount = me?.unread_count ?? 0;

  // Self-heal: kalau baris players ternyata hilang (misal kehapus manual
  // padahal akun auth-nya masih ada), buat ulang otomatis biar tidak
  // ada user yang "nyangkut" login tapi datanya kosong permanen.
  if (!me) {
    const { data: recreated } = await supabase
      .from("players")
      .upsert(
        {
          auth_user_id: user.id,
          email: user.email,
          full_name:
            user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: "auth_user_id" }
      )
      .select("id, nickname, full_name, avatar_url, whatsapp, gender, instagram")
      .single();
    me = recreated ? { ...recreated, unread_count: 0 } : null;
    unreadCount = 0;
  }

  // Profil belum lengkap (biasanya user baru dari login Google) -> isi dulu
  if (!isProfileComplete(me)) redirect("/onboarding");

  const displayName = me?.nickname || me?.full_name || user.email || "Pemain";

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar
        avatarUrl={me?.avatar_url ?? null}
        displayName={displayName}
        unreadCount={unreadCount ?? 0}
      />
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
