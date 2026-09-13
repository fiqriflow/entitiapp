import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isProfileComplete } from "@/lib/constants";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
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

  // Kalau profil sudah lengkap, tidak perlu onboarding lagi
  if (isProfileComplete(me)) redirect("/beranda");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-6 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
            EB
          </div>
          <h1 className="text-xl font-semibold text-ink">Lengkapi Profil</h1>
          <p className="text-sm text-ink/60">
            Isi data di bawah dulu sebelum lanjut pakai aplikasi.
          </p>
        </div>

        <OnboardingForm
          initial={{
            full_name: me?.full_name ?? "",
            nickname: me?.nickname ?? "",
            whatsapp: me?.whatsapp ?? "",
            level: (me?.level as "newbie" | "beginner" | "intermediate" | "advance") ?? "newbie",
            gender: (me?.gender as "pria" | "wanita" | "") ?? "",
            instagram: me?.instagram ?? "",
          }}
        />
      </div>
    </main>
  );
}
