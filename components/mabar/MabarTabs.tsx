"use client";

import { useState } from "react";
import MabarEventCard, { type MabarCardData } from "./MabarEventCard";

export default function MabarTabs({
  myEvents,
  pastEvents,
}: {
  myEvents: MabarCardData[];
  pastEvents: MabarCardData[];
}) {
  const [tab, setTab] = useState<"mine" | "selesai">("mine");

  const list = tab === "mine" ? myEvents : pastEvents;

  return (
    <div>
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
        <button
          onClick={() => setTab("mine")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            tab === "mine" ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          My Mabar
        </button>
        <button
          onClick={() => setTab("selesai")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            tab === "selesai" ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          Selesai
        </button>
      </div>

      <div className="mt-4 space-y-2.5">
        {list.map((event) => (
          <MabarEventCard
            key={event.id}
            event={event}
            showCompletionBadge={tab === "selesai"}
          />
        ))}
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink/40">
            {tab === "mine"
              ? "Kamu belum join mabar apapun."
              : "Belum ada riwayat mabar yang selesai."}
          </div>
        )}
      </div>
    </div>
  );
}
