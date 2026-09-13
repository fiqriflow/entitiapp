import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationItem from "@/components/notifikasi/NotificationItem";
import NotificationToolbar from "@/components/notifikasi/NotificationToolbar";

export const dynamic = "force-dynamic";

export default async function NotifikasiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, link_url, is_read, created_at")
    .eq("player_id", me?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(50);

  const hasUnread = (notifications ?? []).some((n) => !n.is_read);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Notifikasi</h1>
        <NotificationToolbar
          hasUnread={hasUnread}
          hasAny={(notifications ?? []).length > 0}
        />
      </div>

      <div className="mt-4 space-y-2">
        {(notifications ?? []).map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
        {(notifications ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-3xl">🔔</p>
            <p className="mt-3 text-sm font-medium text-ink">
              Belum ada notifikasi
            </p>
            <p className="mt-1 text-sm text-ink/50">
              Notifikasi mabar & aktivitas komunitas bakal muncul di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
