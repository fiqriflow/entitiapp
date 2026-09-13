"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead, deleteNotification } from "../actions";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

const ICON_BY_TYPE: Record<string, string> = {
  mabar_baru: "🏸",
  waitlist_promoted: "🎉",
  mabar_approved: "✅",
  peserta_baru: "👋",
  reminder_h1: "📅",
  reminder_hari_ini: "⏰",
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationItem({
  notification,
}: {
  notification: NotificationRow;
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleClick = async () => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
    if (notification.link_url) {
      router.push(notification.link_url);
    } else {
      router.refresh();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startDeleteTransition(async () => {
      await deleteNotification(notification.id);
      router.refresh();
    });
  };

  return (
    <div
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
        notification.is_read
          ? "border-black/10 bg-white"
          : "border-brand/20 bg-brand-light"
      } ${isDeleting ? "opacity-40" : ""}`}
    >
      <button onClick={handleClick} className="flex flex-1 items-start gap-3 text-left">
        <span className="text-xl">
          {ICON_BY_TYPE[notification.type] ?? "🔔"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm ${
                notification.is_read
                  ? "font-medium text-ink/80"
                  : "font-semibold text-ink"
              }`}
            >
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
            )}
          </div>
          {notification.body && (
            <p className="mt-0.5 text-sm text-ink/60">{notification.body}</p>
          )}
          <p className="mt-1 text-xs text-ink/40">
            {formatTime(notification.created_at)}
          </p>
        </div>
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Hapus notifikasi"
        className="shrink-0 rounded-full p-1 text-ink/30 hover:bg-black/5 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
