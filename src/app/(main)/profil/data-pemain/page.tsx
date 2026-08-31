import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LEVEL_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-3 last:border-b-0">
      <span className="text-xs text-ink/50">{label}</span>
      <span className="text-sm font-medium text-ink">{value || "-"}</span>
    </div>
  );
}

export default async function DataPemainPage() {
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
        href="/profil"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50"
      >
        ← Kembali
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Data Pemain</h1>
          <p className="mt-1 text-sm text-ink/60">Data diri kamu di komunitas.</p>
        </div>
        <Link
          href="/profil/data-pemain/edit"
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white"
        >
          ✏️ Edit
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white px-4">
        <Row label="Nama Lengkap" value={me?.full_name ?? ""} />
        <Row label="Nama Panggilan" value={me?.nickname ?? ""} />
        <Row label="No. WhatsApp" value={me?.whatsapp ?? ""} />
        <Row label="Level" value={LEVEL_LABEL[me?.level ?? ""] ?? "-"} />
        <Row
          label="Gender"
          value={me?.gender === "pria" ? "Pria" : me?.gender === "wanita" ? "Wanita" : ""}
        />
        <Row label="Instagram" value={me?.instagram ?? ""} />
      </div>

      {!(me?.full_name && me?.whatsapp && me?.gender) && (
        <p className="mt-3 text-xs text-amber-700">
          ⚠️ Data kamu belum lengkap — lengkapi dulu supaya bisa join mabar.
        </p>
      )}
    </div>
  );
}
