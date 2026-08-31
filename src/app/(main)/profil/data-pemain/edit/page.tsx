import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "../../_components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function EditDataPemainPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("players")
    .select("full_name, nickname, whatsapp, level, gender, instagram")
    .eq("auth_user_id", user.id)
    .single();

  return (
    <div>
      <Link
        href="/profil/data-pemain"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50"
      >
        ← Kembali
      </Link>

      <h1 className="text-xl font-semibold text-ink">Edit Data Pemain</h1>
      <p className="mt-1 text-sm text-ink/60">
        Lengkapi data diri kamu supaya sesama pemain gampang kenalan.
      </p>

      {redirectTo && (
        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          Lengkapi Nama Lengkap, No. WhatsApp, dan Gender dulu ya sebelum
          join mabar.
        </div>
      )}

      <div className="mt-6">
        <ProfileForm
          redirectTo={redirectTo}
          initial={{
            full_name: me?.full_name ?? "",
            nickname: me?.nickname ?? "",
            whatsapp: me?.whatsapp ?? "",
            level:
              (me?.level as "newbie" | "beginner" | "intermediate" | "advance") ??
              "newbie",
            gender: (me?.gender as "pria" | "wanita" | "") ?? "",
            instagram: me?.instagram ?? "",
          }}
        />
      </div>
    </div>
  );
}
