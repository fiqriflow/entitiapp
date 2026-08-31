import { createClient } from "@/lib/supabase/server";
import AvatarPresetListClient from "./_components/AvatarPresetListClient";

export const dynamic = "force-dynamic";

export default async function AdminAvatarPage() {
  const supabase = await createClient();

  const { data: presets } = await supabase
    .from("avatar_presets")
    .select("id, image_url, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Avatar Preset</h1>
      <p className="mt-1 text-sm text-ink/60">
        Kelola pilihan avatar yang bisa dipilih pemain di halaman Profil.
      </p>

      <div className="mt-6">
        <AvatarPresetListClient presets={presets ?? []} />
      </div>
    </div>
  );
}
