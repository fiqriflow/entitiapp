import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteAccountForm from "@/components/profil/DeleteAccountForm";

export const dynamic = "force-dynamic";

export default async function HapusAkunPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("players")
    .select("nickname, full_name")
    .eq("auth_user_id", user.id)
    .single();

  const nickname = me?.nickname || me?.full_name || "";

  return (
    <div>
      <Link
        href="/profil"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50"
      >
        ← Kembali
      </Link>

      <h1 className="text-xl font-semibold text-ink">Hapus Akun</h1>
      <p className="mt-1 text-sm text-ink/60">
        Tindakan ini tidak bisa dibatalkan.
      </p>

      <DeleteAccountForm nickname={nickname} />
    </div>
  );
}
