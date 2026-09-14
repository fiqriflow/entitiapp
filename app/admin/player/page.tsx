import { createClient, getCurrentUser } from "@/lib/supabase/server";
import PlayerListClient from "@/components/admin/player/PlayerListClient";

export const dynamic = "force-dynamic";

export default async function AdminPlayerPage() {
  const supabase = await createClient();

  const user = await getCurrentUser();

  const { data: players } = await supabase
    .from("players")
    .select(
      "id, auth_user_id, full_name, nickname, email, whatsapp, level, gender, instagram, role"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Player</h1>
      <p className="mt-1 text-sm text-ink/60">
        Kelola data pemain komunitas. Pemain baru bisa didaftarkan manual di
        sini (nanti otomatis ke-link saat mereka login pakai email yang
        sama), atau otomatis muncul saat mereka login sendiri.
      </p>

      <div className="mt-6">
        <PlayerListClient players={players ?? []} currentUserId={user?.id ?? null} />
      </div>
    </div>
  );
}
