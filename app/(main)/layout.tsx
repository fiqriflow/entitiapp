import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isProfileComplete } from "@/lib/constants";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: me } = await supabase
    .from("players")
    .select("id, nickname, full_name, avatar_url, whatsapp, gender, instagram")
    .eq("auth_user_id", user.id)
    .single();

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
    me = recreated;
  }

  // Profil belum lengkap (biasanya user baru dari login Google) -> isi dulu
  if (!isProfileComplete(me)) redirect("/onboarding");

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("player_id", me?.id ?? "")
    .eq("is_read", false);

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
