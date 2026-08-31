"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMabarEvent } from "@/app/admin/mabar/actions";

export default function DeleteMabarButton({
  mabarId,
  mabarTitle,
}: {
  mabarId: string;
  mabarTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    const confirmed = confirm(
      `Hapus mabar "${mabarTitle}"?\n\nRiwayat mabar ini — termasuk data peserta, hasil pertandingan, dan ranking — akan TERHAPUS PERMANEN dan tidak bisa dikembalikan.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteMabarEvent(mabarId);
      router.push("/mabar");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="mt-2 w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 disabled:opacity-50"
    >
      {isPending ? "Menghapus..." : "🗑️ Hapus Mabar"}
    </button>
  );
}
