import { createClient } from "@/lib/supabase/server";
import BannerPengumumanTabs from "@/components/admin/banner/BannerPengumumanTabs";

export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
  const supabase = await createClient();

  const [{ data: allBanners }, { data: announcements }] = await Promise.all([
    supabase
      .from("hero_banners")
      .select("id, image_url, link_url, is_active, sort_order, purpose")
      .order("sort_order", { ascending: true }),
    supabase
      .from("announcements")
      .select("id, title, content, is_active")
      .order("created_at", { ascending: false }),
  ]);

  const heroBanners = (allBanners ?? []).filter(
    (b) => (b.purpose ?? "beranda") === "beranda"
  );
  const mabarHeaderBanners = (allBanners ?? []).filter(
    (b) => b.purpose === "mabar_detail"
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Banner</h1>
      <p className="mt-1 text-sm text-ink/60">
        Kelola hero banner, header mabar, dan pengumuman.
      </p>

      <div className="mt-6">
        <BannerPengumumanTabs
          heroBanners={heroBanners}
          mabarHeaderBanners={mabarHeaderBanners}
          announcements={announcements ?? []}
        />
      </div>
    </div>
  );
}
