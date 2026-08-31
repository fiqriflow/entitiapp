import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AvatarUpload from "./_components/AvatarUpload";
import MenuRow from "./_components/MenuRow";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("players")
    .select("full_name, nickname, avatar_url, role")
    .eq("auth_user_id", user.id)
    .single();

  const { data: presets } = await supabase
    .from("avatar_presets")
    .select("image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const presetAvatars = (presets ?? []).map((p) => p.image_url);

  const displayName = me?.nickname || me?.full_name || user.email || "Pemain";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <AvatarUpload
          userId={user.id}
          currentUrl={me?.avatar_url ?? null}
          displayName={displayName}
          presetAvatars={presetAvatars}
        />
        <p className="mt-3 text-center text-sm font-semibold text-ink">
          {displayName}
        </p>
        <p className="text-center text-xs text-ink/50">{user.email}</p>
      </div>

      <div>
        <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Profil
        </p>
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <MenuRow href="/profil/data-pemain" icon="🏸" label="Data Pemain" />
        </div>
      </div>

      <div>
        <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Bantuan
        </p>
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <MenuRow href="/faq" icon="❓" label="FAQ" />
          <MenuRow href="/tentang" icon="ℹ️" label="Tentang Kami" />
        </div>
      </div>

      <div>
        <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Akun
        </p>
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          {me?.role === "admin" && (
            <MenuRow href="/admin" icon="⚙️" label="Panel Admin" />
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 border-b border-black/5 px-4 py-3.5 text-left last:border-b-0 hover:bg-black/[0.02]"
            >
              <span className="text-lg">🚪</span>
              <span className="flex-1 text-sm font-medium text-red-600">
                Keluar
              </span>
            </button>
          </form>
          <MenuRow
            href="/profil/hapus-akun"
            icon="⚠️"
            label="Hapus Akun"
            danger
          />
        </div>
      </div>
    </div>
  );
}
