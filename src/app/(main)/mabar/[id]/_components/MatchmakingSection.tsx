"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  generateRound,
  updateMatchSets,
  deleteSession,
} from "../matchmaking-actions";

export type PlayerInfo = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export type SetScore = { a: number; b: number };

export type MatchRow = {
  id: string;
  session_id: string;
  court_label: string;
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
  sets: SetScore[];
};

export type SessionRow = {
  id: string;
  round_number: number;
};

export type LeaderboardRow = {
  playerId: string;
  points: number;
  wins: number;
  gamesPlayed: number;
};

function computeResult(sets: SetScore[]) {
  let setsWonA = 0;
  let setsWonB = 0;
  for (const s of sets) {
    if (s.a > s.b) setsWonA++;
    else if (s.b > s.a) setsWonB++;
  }
  const totalMain = sets.length;
  const winner: "a" | "b" | null =
    setsWonA === setsWonB ? null : setsWonA > setsWonB ? "a" : "b";
  return { setsWonA, setsWonB, totalMain, winner };
}

function Player({ p }: { p: PlayerInfo | undefined }) {
  if (!p) return <span className="text-ink/40">?</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      {p.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-[9px] font-semibold text-ink/50">
          {p.name[0]?.toUpperCase()}
        </span>
      )}
      {p.name}
    </span>
  );
}

function MatchCard({
  match,
  playersById,
  isAdmin,
  mabarId,
}: {
  match: MatchRow;
  playersById: Record<string, PlayerInfo>;
  isAdmin: boolean;
  mabarId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<(SetScore | null)[]>(() => {
    const base: (SetScore | null)[] = [null, null, null];
    match.sets.forEach((s, i) => {
      if (i < 3) base[i] = s;
    });
    return base;
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const result = computeResult(match.sets);

  const setDraftValue = (idx: number, side: "a" | "b", value: string) => {
    setDraft((prev) => {
      const next = [...prev];
      const current = next[idx] ?? { a: 0, b: 0 };
      next[idx] = { ...current, [side]: value === "" ? 0 : Number(value) };
      return next;
    });
  };

  const handleSave = () => {
    const cleanSets: SetScore[] = draft
      .filter((s): s is SetScore => s !== null)
      .filter((s) => !(s.a === 0 && s.b === 0));

    startTransition(async () => {
      await updateMatchSets(match.id, mabarId, cleanSets);
      setEditing(false);
      router.refresh();
    });
  };

  const handleCancel = () => {
    const base: (SetScore | null)[] = [null, null, null];
    match.sets.forEach((s, i) => {
      if (i < 3) base[i] = s;
    });
    setDraft(base);
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-black/5 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-ink/40">{match.court_label}</p>
        {isAdmin && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] font-medium text-brand-dark"
          >
            Edit
          </button>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div
          className={`text-sm ${
            result.winner === "a" ? "font-semibold text-brand-dark" : "text-ink"
          }`}
        >
          <Player p={playersById[match.team_a_player1]} />
          <span className="text-ink/30"> & </span>
          <Player p={playersById[match.team_a_player2]} />
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div
          className={`text-sm ${
            result.winner === "b" ? "font-semibold text-brand-dark" : "text-ink"
          }`}
        >
          <Player p={playersById[match.team_b_player1]} />
          <span className="text-ink/30"> & </span>
          <Player p={playersById[match.team_b_player2]} />
        </div>
      </div>

      {!editing ? (
        <>
          {match.sets.length > 0 ? (
            <div className="mt-2 space-y-1 rounded-md bg-neutral-50 px-2.5 py-2">
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink/60">
                {match.sets.map((s, i) => (
                  <span key={i}>
                    Set {i + 1}: <span className="font-medium text-ink">{s.a}-{s.b}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs font-medium text-ink/70">
                {result.winner
                  ? `Tim ${result.winner === "a" ? "A" : "B"} menang ${Math.max(
                      result.setsWonA,
                      result.setsWonB
                    )}-${Math.min(result.setsWonA, result.setsWonB)}`
                  : `Seri ${result.setsWonA}-${result.setsWonB}`}
                {" · "}Total main: {result.totalMain} set
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-ink/30">Skor belum diinput.</p>
          )}
        </>
      ) : (
        <div className="mt-2 space-y-1.5 rounded-md bg-neutral-50 p-2.5">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-10 text-ink/50">Set {idx + 1}</span>
              <input
                type="number"
                value={draft[idx]?.a ?? ""}
                onChange={(e) => setDraftValue(idx, "a", e.target.value)}
                className="w-14 rounded-md border border-black/10 px-1.5 py-1 text-center"
                placeholder="A"
              />
              <span className="text-ink/30">-</span>
              <input
                type="number"
                value={draft[idx]?.b ?? ""}
                onChange={(e) => setDraftValue(idx, "b", e.target.value)}
                className="w-14 rounded-md border border-black/10 px-1.5 py-1 text-center"
                placeholder="B"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 rounded-md border border-black/10 py-1.5 text-xs font-medium text-ink"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 rounded-md bg-brand py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchmakingSection({
  mabarId,
  isAdmin,
  checkedInCount,
  sessions,
  matches,
  playersById,
}: {
  mabarId: string;
  isAdmin: boolean;
  checkedInCount: number;
  sessions: SessionRow[];
  matches: MatchRow[];
  playersById: Record<string, PlayerInfo>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateRound(mabarId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!confirm("Hapus ronde ini beserta semua skornya?")) return;
    setDeletingId(sessionId);
    startTransition(async () => {
      await deleteSession(sessionId, mabarId);
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">🏆 Matchmaking & Skor</p>
        {isAdmin && (
          <button
            onClick={handleGenerate}
            disabled={isPending || checkedInCount < 4}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Memproses..." : "🔀 Generate Ronde Baru"}
          </button>
        )}
      </div>

      {isAdmin && checkedInCount < 4 && (
        <p className="mt-1 text-xs text-ink/40">
          Minimal 4 pemain check-in dulu buat mulai matchmaking (sekarang: {checkedInCount}).
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {sessions.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-ink/40">
          Belum ada ronde. {isAdmin ? "Klik \"Generate Ronde Baru\" untuk mulai." : ""}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {sessions.map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink/60">Ronde {s.round_number}</p>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteSession(s.id)}
                    disabled={deletingId === s.id}
                    className="text-[11px] text-red-500 disabled:opacity-50"
                  >
                    {deletingId === s.id ? "..." : "Hapus ronde"}
                  </button>
                )}
              </div>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                {matches
                  .filter((m) => m.session_id === s.id)
                  .map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      playersById={playersById}
                      isAdmin={isAdmin}
                      mabarId={mabarId}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
