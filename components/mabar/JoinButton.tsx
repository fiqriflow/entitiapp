"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinMabar, leaveMabar } from "@/app/(main)/mabar/actions";

export type CommitmentItem = {
  id: string;
  text: string;
};

export default function JoinButton({
  mabarId,
  myStatus,
  isFull,
  isActive,
  isPrivate,
  isCompleted,
  commitmentItems,
}: {
  mabarId: string;
  myStatus: "joined" | "waitlist" | "pending" | null;
  isFull: boolean;
  isActive: boolean;
  isPrivate: boolean;
  isCompleted: boolean;
  commitmentItems: CommitmentItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const router = useRouter();

  const doJoin = () => {
    setError(null);
    startTransition(async () => {
      const result = await joinMabar(mabarId);
      if (result.needsProfile) {
        router.push(
          `/profil/data-pemain/edit?redirectTo=${encodeURIComponent(`/mabar/${mabarId}`)}`
        );
        return;
      }
      if (result.error) {
        setError(result.error);
        return;
      }
      setChecklistOpen(false);
      router.refresh();
    });
  };

  const handleJoinClick = () => {
    if (commitmentItems.length > 0) {
      setChecked(new Set());
      setChecklistOpen(true);
      return;
    }
    doJoin();
  };

  const handleLeave = () => {
    if (!confirm("Batal ikut mabar ini?")) return;
    setError(null);
    startTransition(async () => {
      const result = await leaveMabar(mabarId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allChecked =
    commitmentItems.length > 0 && checked.size === commitmentItems.length;

  if (!isActive || isCompleted) {
    return (
      <button
        disabled
        className="w-full rounded-xl bg-neutral-200 py-3 text-sm font-medium text-ink/40"
      >
        {isCompleted ? "Mabar sudah selesai" : "Mabar sudah ditutup"}
      </button>
    );
  }

  if (myStatus) {
    return (
      <div>
        {myStatus === "pending" && (
          <p className="mb-2 text-center text-xs text-blue-700">
            Permintaan join kamu sedang menunggu persetujuan admin.
          </p>
        )}
        <button
          onClick={handleLeave}
          disabled={isPending}
          className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 disabled:opacity-60"
        >
          {isPending
            ? "Memproses..."
            : myStatus === "joined"
            ? "Batal Ikut"
            : myStatus === "pending"
            ? "Batalkan Permintaan"
            : "Keluar dari Waitlist"}
        </button>
        {error && (
          <p className="mt-2 text-center text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleJoinClick}
        disabled={isPending}
        className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending
          ? "Memproses..."
          : isPrivate
          ? "Ajukan Join (butuh approval)"
          : isFull
          ? "Gabung Waitlist"
          : "Join Mabar"}
      </button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-600">{error}</p>
      )}

      {checklistOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 md:items-center"
          onClick={() => setChecklistOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-ink">
              Komitmen Sebelum Join
            </h2>
            <p className="mt-1 text-xs text-ink/50">
              Centang semua poin di bawah sebelum konfirmasi join.
            </p>

            <div className="mt-4 space-y-2.5">
              {commitmentItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 rounded-lg border border-black/10 p-3"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 accent-brand"
                  />
                  <span className="text-sm text-ink/80">{item.text}</span>
                </label>
              ))}
            </div>

            {error && (
              <p className="mt-3 text-center text-xs text-red-600">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setChecklistOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink"
              >
                Batal
              </button>
              <button
                onClick={doJoin}
                disabled={!allChecked || isPending}
                className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {isPending ? "Memproses..." : "Konfirmasi Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
