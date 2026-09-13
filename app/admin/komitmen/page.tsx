import { createClient } from "@/lib/supabase/server";
import KomitmenListClient from "@/components/admin/komitmen/KomitmenListClient";

export const dynamic = "force-dynamic";

export default async function AdminKomitmenPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("commitment_items")
    .select("id, text, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Komitmen</h1>
      <p className="mt-1 text-sm text-ink/60">
        Poin-poin yang wajib dicentang pemain sebelum bisa join mabar. Yang
        &quot;Aktif&quot; aja yang ditampilkan.
      </p>

      <div className="mt-6">
        <KomitmenListClient items={items ?? []} />
      </div>
    </div>
  );
}
