"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type HistoryMatch = {
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
};

function pairKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("players")
    .select("id, role")
    .eq("auth_user_id", user?.id ?? "")
    .single();

  if (me?.role !== "admin") return { supabase, ok: false as const };
  return { supabase, ok: true as const };
}

/**
 * Generate satu ronde baru dengan format Americano:
 * partner & lawan dirotasi sebisa mungkin beda dari ronde sebelumnya.
 * Kalau jumlah pemain bukan kelipatan 4, sebagian dapat giliran istirahat
 * (bergilir juga biar adil).
 */
export async function generateRound(mabarId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Cuma admin yang bisa generate ronde." };

  // Ambil pemain yang sudah check-in
  const { data: participants } = await supabase
    .from("mabar_participants")
    .select("player_id")
    .eq("mabar_id", mabarId)
    .eq("status", "joined")
    .eq("checked_in", true);

  const playerIds = (participants ?? []).map((p) => p.player_id);

  if (playerIds.length < 4) {
    return { error: "Minimal 4 pemain yang sudah check-in untuk mulai matchmaking." };
  }

  // Ambil histori match mabar ini buat hitung siapa udah pernah barengan/lawan siapa
  const { data: history } = await supabase
    .from("mabar_matches")
    .select("team_a_player1, team_a_player2, team_b_player1, team_b_player2")
    .eq("mabar_id", mabarId);

  const partnerCount: Record<string, number> = {};
  const opponentCount: Record<string, number> = {};
  const gamesPlayed: Record<string, number> = {};
  const benchCount: Record<string, number> = {};

  for (const id of playerIds) {
    gamesPlayed[id] = 0;
    benchCount[id] = 0;
  }

  for (const m of (history ?? []) as HistoryMatch[]) {
    const a = [m.team_a_player1, m.team_a_player2];
    const b = [m.team_b_player1, m.team_b_player2];
    const addPartner = (x: string, y: string) => {
      const k = pairKey(x, y);
      partnerCount[k] = (partnerCount[k] ?? 0) + 1;
    };
    const addOpponent = (x: string, y: string) => {
      const k = pairKey(x, y);
      opponentCount[k] = (opponentCount[k] ?? 0) + 1;
    };
    addPartner(a[0], a[1]);
    addPartner(b[0], b[1]);
    for (const x of a) for (const y of b) addOpponent(x, y);
    for (const id of [...a, ...b]) {
      if (id in gamesPlayed) gamesPlayed[id] = (gamesPlayed[id] ?? 0) + 1;
    }
  }

  // Hitung bench count dari histori: siapa yang tercatat check-in tapi
  // tidak ada di gamesPlayed penuh ronde sebelumnya — didekati dari selisih
  // total ronde vs gamesPlayed masing2 (perkiraan cukup untuk rotasi adil)
  const { count: totalSessions } = await supabase
    .from("mabar_sessions")
    .select("*", { count: "exact", head: true })
    .eq("mabar_id", mabarId);

  for (const id of playerIds) {
    benchCount[id] = Math.max(0, (totalSessions ?? 0) - gamesPlayed[id]);
  }

  // Tentukan siapa istirahat ronde ini
  const benchNeeded = playerIds.length % 4;
  let playing = [...playerIds];
  const resting: string[] = [];

  if (benchNeeded > 0) {
    const sorted = [...playerIds].sort((x, y) => {
      // prioritas istirahat: udah paling banyak main, paling sedikit istirahat
      const scoreX = gamesPlayed[x] - benchCount[x];
      const scoreY = gamesPlayed[y] - benchCount[y];
      return scoreY - scoreX;
    });
    for (let i = 0; i < benchNeeded; i++) {
      resting.push(sorted[i]);
    }
    playing = playerIds.filter((id) => !resting.includes(id));
  }

  // Acak urutan dulu biar variatif kalau ada beberapa opsi dengan cost sama
  playing = playing.sort(() => Math.random() - 0.5);

  // Pairing partner: greedy, minimalkan partnerCount
  const unpaired = [...playing];
  const pairs: [string, string][] = [];
  while (unpaired.length > 0) {
    const p1 = unpaired.shift()!;
    let bestIdx = 0;
    let bestCost = Infinity;
    unpaired.forEach((p2, idx) => {
      const cost = partnerCount[pairKey(p1, p2)] ?? 0;
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = idx;
      }
    });
    const p2 = unpaired.splice(bestIdx, 1)[0];
    pairs.push([p1, p2]);
  }

  // Pairing lawan antar pair: greedy, minimalkan total opponentCount
  const unmatchedPairs = [...pairs];
  const courts: { teamA: [string, string]; teamB: [string, string] }[] = [];
  while (unmatchedPairs.length > 0) {
    const pairA = unmatchedPairs.shift()!;
    let bestIdx = 0;
    let bestCost = Infinity;
    unmatchedPairs.forEach((pairB, idx) => {
      const cost =
        (opponentCount[pairKey(pairA[0], pairB[0])] ?? 0) +
        (opponentCount[pairKey(pairA[0], pairB[1])] ?? 0) +
        (opponentCount[pairKey(pairA[1], pairB[0])] ?? 0) +
        (opponentCount[pairKey(pairA[1], pairB[1])] ?? 0);
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = idx;
      }
    });
    const pairB = unmatchedPairs.splice(bestIdx, 1)[0];
    courts.push({ teamA: pairA, teamB: pairB });
  }

  const roundNumber = (totalSessions ?? 0) + 1;

  const { data: session, error: sessionError } = await supabase
    .from("mabar_sessions")
    .insert({ mabar_id: mabarId, round_number: roundNumber })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { error: sessionError?.message ?? "Gagal membuat ronde." };
  }

  const matchRows = courts.map((c, i) => ({
    session_id: session.id,
    mabar_id: mabarId,
    court_label: `Lapangan ${i + 1}`,
    team_a_player1: c.teamA[0],
    team_a_player2: c.teamA[1],
    team_b_player1: c.teamB[0],
    team_b_player2: c.teamB[1],
  }));

  const { error: matchError } = await supabase
    .from("mabar_matches")
    .insert(matchRows);

  if (matchError) return { error: matchError.message };

  revalidatePath(`/mabar/${mabarId}`);
  return { error: null, restingCount: resting.length };
}

export async function updateMatchSets(
  matchId: string,
  mabarId: string,
  sets: { a: number; b: number }[]
) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Cuma admin yang bisa input skor." };

  const { error } = await supabase
    .from("mabar_matches")
    .update({ sets })
    .eq("id", matchId);

  if (error) return { error: error.message };

  revalidatePath(`/mabar/${mabarId}`);
  return { error: null };
}

export async function deleteSession(sessionId: string, mabarId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Cuma admin yang bisa hapus ronde." };

  const { error } = await supabase
    .from("mabar_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) return { error: error.message };

  revalidatePath(`/mabar/${mabarId}`);
  return { error: null };
}
