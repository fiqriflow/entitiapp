"use client";

import { useState, type ReactNode } from "react";

export default function MabarDetailTabs({
  detailTab,
  playersTab,
  matchmakingTab,
  rankingTab,
  playersCount,
  showMatchmakingTab,
}: {
  detailTab: ReactNode;
  playersTab: ReactNode;
  matchmakingTab: ReactNode;
  rankingTab: ReactNode;
  playersCount: number;
  showMatchmakingTab: boolean;
}) {
  const [tab, setTab] = useState<"detail" | "players" | "matchmaking" | "ranking">(
    "detail"
  );

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-neutral-100 p-1 no-scrollbar">
        <button
          onClick={() => setTab("detail")}
          className={`shrink-0 flex-1 rounded-lg py-2 px-2 text-xs font-medium transition sm:text-sm ${
            tab === "detail" ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          Detail
        </button>
        <button
          onClick={() => setTab("players")}
          className={`shrink-0 flex-1 rounded-lg py-2 px-2 text-xs font-medium transition sm:text-sm ${
            tab === "players" ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          Peserta{playersCount > 0 ? ` (${playersCount})` : ""}
        </button>
        {showMatchmakingTab && (
          <>
            <button
              onClick={() => setTab("matchmaking")}
              className={`shrink-0 flex-1 rounded-lg py-2 px-2 text-xs font-medium transition sm:text-sm ${
                tab === "matchmaking"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink/50"
              }`}
            >
              Matchmaking
            </button>
            <button
              onClick={() => setTab("ranking")}
              className={`shrink-0 flex-1 rounded-lg py-2 px-2 text-xs font-medium transition sm:text-sm ${
                tab === "ranking" ? "bg-white text-ink shadow-sm" : "text-ink/50"
              }`}
            >
              Ranking
            </button>
          </>
        )}
      </div>

      <div className="mt-4">
        <div className={tab === "detail" ? "block" : "hidden"}>{detailTab}</div>
        <div className={tab === "players" ? "block" : "hidden"}>{playersTab}</div>
        {showMatchmakingTab && (
          <>
            <div className={tab === "matchmaking" ? "block" : "hidden"}>
              {matchmakingTab}
            </div>
            <div className={tab === "ranking" ? "block" : "hidden"}>
              {rankingTab}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
