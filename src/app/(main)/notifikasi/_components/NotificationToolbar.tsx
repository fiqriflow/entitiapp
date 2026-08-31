"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead, clearAllNotifications } from "../actions";

export default function NotificationToolbar({
  hasUnread,
  hasAny,
}: {
  hasUnread: boolean;
  hasAny: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmClear, setConfirmClear] = useState(false);
  const router = useRouter();

  if (!hasAny) return null;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    startTransition(async () => {
      await clearAllNotifications();
      setConfirmClear(false);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3">
      {hasUnread && (
        <button
          onClick={handleMarkAllRead}
          disabled={isPending}
          className="text-xs font-medium text-brand-dark disabled:opacity-60"
        >
          {isPending ? "Memproses..." : "Tandai semua dibaca"}
        </button>
      )}
      <button
        onClick={handleClear}
        onBlur={() => setConfirmClear(false)}
        disabled={isPending}
        className={`text-xs font-medium disabled:opacity-60 ${
          confirmClear ? "text-red-600" : "text-ink/40"
        }`}
      >
        {isPending
          ? "Menghapus..."
          : confirmClear
          ? "Yakin hapus semua?"
          : "Hapus semua"}
      </button>
    </div>
  );
}
