"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { PlayerInfo, LeaderboardRow } from "./MatchmakingSection";

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

function EntitiLogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand">
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            d="M12 2c-2.2 3-2.2 6 0 9 2.2-3 2.2-6 0-9z M6 22c1-3.5 3-5.5 6-6 3 .5 5 2.5 6 6"
            fill="#ffffff"
          />
          <circle cx="12" cy="13.5" r="2.6" fill="#ffffff" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-tight text-white">
          ENTITI
        </p>
        <p className="text-[7px] font-semibold uppercase tracking-widest text-white/80">
          Badminton Community
        </p>
      </div>
    </div>
  );
}

export default function RankingSection({
  mabarTitle,
  eventDate,
  leaderboard,
  playersById,
  myPlayerId,
}: {
  mabarTitle: string;
  eventDate: string;
  leaderboard: LeaderboardRow[];
  playersById: Record<string, PlayerInfo>;
  myPlayerId?: string | null;
}) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const sorted = [...leaderboard].sort((a, b) => b.points - a.points);
  const medals = ["🥇", "🥈", "🥉"];

  const handleDownload = async (playerId: string, rank: number, name: string) => {
    const node = cardRefs.current[playerId];
    if (!node) return;
    setDownloadingId(playerId);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: undefined,
        width: 540,
        height: 960,
      });
      const link = document.createElement("a");
      link.download = `rank-${rank}-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Gagal membuat gambar. Coba lagi ya.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink/40">
        Belum ada ranking. Input skor match dulu di tab Matchmaking.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink">🏆 Ranking Sesi Ini</p>

      <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-medium text-ink/50">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Pemain</th>
              <th className="px-3 py-2 text-right">Poin</th>
              <th className="px-3 py-2 text-right">Menang</th>
              <th className="px-3 py-2 text-right">Main</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const name = playersById[row.playerId]?.name ?? "Pemain";
              return (
                <tr key={row.playerId} className="border-t border-black/5">
                  <td className="px-3 py-2 text-ink/60">{medals[i] ?? i + 1}</td>
                  <td className="px-3 py-2 font-medium text-ink">{name}</td>
                  <td className="px-3 py-2 text-right font-semibold text-ink">
                    {row.points}
                  </td>
                  <td className="px-3 py-2 text-right text-ink/60">{row.wins}</td>
                  <td className="px-3 py-2 text-right text-ink/60">
                    {row.gamesPlayed}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {row.playerId === myPlayerId && (
                      <button
                        onClick={() => handleDownload(row.playerId, i + 1, name)}
                        disabled={downloadingId === row.playerId}
                        className="rounded-md bg-brand px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                      >
                        {downloadingId === row.playerId ? "..." : "📤 Share"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Template story card per pemain (di-capture jadi PNG, background transparan) */}
      <div className="h-0 w-0 overflow-hidden">
        {sorted.map((row, i) => {
          const name = playersById[row.playerId]?.name ?? "Pemain";
          return (
            <div
              key={row.playerId}
              ref={(el) => {
                cardRefs.current[row.playerId] = el;
              }}
              style={{ width: 540, height: 960 }}
              className="relative"
            >
              <div
                className="absolute inset-x-0 bottom-0 flex flex-col justify-between bg-black/45 px-9 py-9"
                style={{ height: "34%" }}
              >
                <EntitiLogoMark />
                <div>
                  <p className="text-[15px] font-medium text-white/85">
                    {formatDateShort(eventDate)}
                  </p>
                  <p className="mt-4 text-[19px] font-medium text-white/85">
                    Rank
                  </p>
                  <p className="mt-1 text-[46px] font-black leading-none text-white">
                    #{i + 1}{" "}
                    <span className="align-middle text-[34px] font-extrabold">
                      {name}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
