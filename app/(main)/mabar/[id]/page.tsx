import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import JoinButton from "@/components/mabar/JoinButton";
import DeleteMabarButton from "@/components/mabar/DeleteMabarButton";
import PlayerList, { type ParticipantRow } from "@/components/mabar/PlayerList";
import PendingApprovalList from "@/components/mabar/PendingApprovalList";
import MatchmakingSection, {
  type PlayerInfo,
  type MatchRow,
  type SessionRow,
  type LeaderboardRow,
} from "@/components/mabar/MatchmakingSection";
import MabarDetailTabs from "@/components/mabar/MabarDetailTabs";
import RankingSection from "@/components/mabar/RankingSection";
import { formatRupiah, levelRangeLabel, isMabarCompleted } from "@/lib/constants";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function MabarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: event }, { data: me }, { data: commitmentItems }] = await Promise.all([
    supabase.from("mabar_events").select("*").eq("id", id).single(),
    supabase
      .from("players")
      .select("id, role")
      .eq("auth_user_id", user?.id ?? "")
      .single(),
    supabase
      .from("commitment_items")
      .select("id, text")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!event) notFound();

  const { data: participants } = await supabase
    .from("mabar_participants")
    .select("id, status, joined_at, is_paid, checked_in, player_id, players(full_name, nickname, level, avatar_url, instagram)")
    .eq("mabar_id", id)
    .order("joined_at", { ascending: true });

  const rows = (participants ?? []) as unknown as (ParticipantRow & {
    player_id: string;
  })[];

  const playerIds = [...new Set(rows.map((p) => p.player_id))];
  const totalMainByPlayer: Record<string, number> = {};

  if (playerIds.length > 0) {
    const { data: history } = await supabase
      .from("mabar_participants")
      .select("player_id")
      .eq("status", "joined")
      .in("player_id", playerIds);

    for (const h of history ?? []) {
      totalMainByPlayer[h.player_id] = (totalMainByPlayer[h.player_id] ?? 0) + 1;
    }
  }

  for (const row of rows) {
    row.total_main = totalMainByPlayer[row.player_id] ?? 0;
  }

  const joined = rows.filter((p) => p.status === "joined");
  const waitlist = rows.filter((p) => p.status === "waitlist");
  const pending = rows.filter((p) => p.status === "pending");
  const myStatus = me
    ? (rows.find((p) => p.player_id === me.id)?.status as
        | "joined"
        | "waitlist"
        | "pending"
        | undefined) ?? null
    : null;
  const isFull = joined.length >= event.max_slot;
  const isAdmin = me?.role === "admin";
  const today = new Date().toISOString().slice(0, 10);
  const checkInEnabled = event.event_date <= today;
  const isCompleted = isMabarCompleted(event.event_date, event.completion_override);
  const myPayment = me
    ? rows.find((p) => p.player_id === me.id && p.status === "joined")
    : undefined;

  // Matchmaking & skor
  const checkedInCount = joined.filter((p) => p.checked_in).length;

  const [{ data: sessions }, { data: matches }] = await Promise.all([
    supabase
      .from("mabar_sessions")
      .select("id, round_number")
      .eq("mabar_id", id)
      .order("round_number", { ascending: true }),
    supabase
      .from("mabar_matches")
      .select(
        "id, session_id, court_label, team_a_player1, team_a_player2, team_b_player1, team_b_player2, sets"
      )
      .eq("mabar_id", id)
      .order("court_label", { ascending: true }),
  ]);

  const matchRows: MatchRow[] = matches ?? [];
  const sessionRows: SessionRow[] = sessions ?? [];

  const involvedPlayerIds = [
    ...new Set(
      matchRows.flatMap((m) => [
        m.team_a_player1,
        m.team_a_player2,
        m.team_b_player1,
        m.team_b_player2,
      ])
    ),
  ];

  const playersById: Record<string, PlayerInfo> = {};
  if (involvedPlayerIds.length > 0) {
    const { data: involvedPlayers } = await supabase
      .from("players")
      .select("id, full_name, nickname, avatar_url")
      .in("id", involvedPlayerIds);

    for (const p of involvedPlayers ?? []) {
      playersById[p.id] = {
        id: p.id,
        name: p.nickname || p.full_name || "Pemain",
        avatar_url: p.avatar_url,
      };
    }
  }

  const leaderboardMap: Record<string, LeaderboardRow> = {};
  const ensure = (pid: string) => {
    if (!leaderboardMap[pid]) {
      leaderboardMap[pid] = { playerId: pid, points: 0, wins: 0, gamesPlayed: 0 };
    }
    return leaderboardMap[pid];
  };

  for (const m of matchRows) {
    if (!m.sets || m.sets.length === 0) continue;

    let setsWonA = 0;
    let setsWonB = 0;
    let totalA = 0;
    let totalB = 0;
    for (const s of m.sets) {
      totalA += s.a;
      totalB += s.b;
      if (s.a > s.b) setsWonA++;
      else if (s.b > s.a) setsWonB++;
    }

    const teamA = [m.team_a_player1, m.team_a_player2];
    const teamB = [m.team_b_player1, m.team_b_player2];
    const aWinsMatch = setsWonA > setsWonB;
    const bWinsMatch = setsWonB > setsWonA;

    for (const pid of teamA) {
      const row = ensure(pid);
      row.points += totalA;
      row.gamesPlayed += 1;
      if (aWinsMatch) row.wins += 1;
    }
    for (const pid of teamB) {
      const row = ensure(pid);
      row.points += totalB;
      row.gamesPlayed += 1;
      if (bWinsMatch) row.wins += 1;
    }
  }

  const leaderboard = Object.values(leaderboardMap);

  const { data: headerBanner } = await supabase
    .from("hero_banners")
    .select("image_url")
    .eq("is_active", true)
    .eq("purpose", "mabar_detail")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const headerImageUrl = headerBanner?.image_url ?? "/illustrations/mabar-hero.svg";

  const detailTab = (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <h1 className="text-lg font-semibold text-ink">{event.title}</h1>
          {event.is_private && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              🔒 Privat
            </span>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            event.status === "active"
              ? "bg-brand-light text-brand-dark"
              : "bg-neutral-100 text-ink/50"
          }`}
        >
          {event.status === "active" ? "Aktif" : "Ditutup"}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-ink/60">
        <p>📅 {formatDate(event.event_date)}</p>
        <p>
          🕒 {event.start_time?.slice(0, 5)}
          {event.end_time ? `–${event.end_time.slice(0, 5)}` : ""}
        </p>
        {event.location && <p>📍 {event.location}</p>}
        <p>💰 {formatRupiah(event.price)}</p>
        <p>
          🎯 {levelRangeLabel(event.level_min, event.level_max)}
          {event.gender_restriction
            ? ` · ${event.gender_restriction === "pria" ? "Man Only" : "Woman Only"}`
            : ""}
        </p>
      </div>

      {event.description && (
        <p className="mt-3 text-sm text-ink/70">{event.description}</p>
      )}

      <p className="mt-4 text-xs text-ink/60">
        {joined.length}/{event.max_slot} slot terisi
        {waitlist.length > 0 ? ` · ${waitlist.length} waitlist` : ""}
      </p>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-brand"
          style={{
            width: `${Math.min(100, (joined.length / event.max_slot) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-5">
        {event.price > 0 && myPayment && (
          <div
            className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
              myPayment.is_paid
                ? "bg-brand-light text-brand-dark"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <span>Status pembayaran kamu</span>
            <span>{myPayment.is_paid ? "💰 Lunas" : "⏳ Belum Bayar"}</span>
          </div>
        )}
        <JoinButton
          mabarId={event.id}
          myStatus={myStatus}
          isFull={isFull}
          isActive={event.status === "active"}
          isPrivate={event.is_private}
          isCompleted={isCompleted}
          commitmentItems={commitmentItems ?? []}
        />
        {isAdmin && (
          <DeleteMabarButton mabarId={event.id} mabarTitle={event.title} />
        )}
      </div>
    </div>
  );

  const playersTab = (
    <div className="space-y-6">
      {isAdmin && pending.length > 0 && (
        <PendingApprovalList players={pending} />
      )}

      <PlayerList
        title="Peserta Join"
        players={joined}
        emptyText="Belum ada yang join."
        showPayment={event.price > 0}
        showCheckIn
        checkInEnabled={checkInEnabled}
        isAdmin={isAdmin}
      />

      <PlayerList
        title="Waitlist"
        players={waitlist}
        emptyText="Belum ada waitlist."
      />
    </div>
  );

  const matchmakingTab = (
    <MatchmakingSection
      mabarId={event.id}
      isAdmin={isAdmin}
      checkedInCount={checkedInCount}
      sessions={sessionRows}
      matches={matchRows}
      playersById={playersById}
    />
  );

  const rankingTab = (
    <RankingSection
      mabarTitle={event.title}
      eventDate={event.event_date}
      leaderboard={leaderboard}
      playersById={playersById}
      myPlayerId={me?.id ?? null}
    />
  );

  return (
    <div className="space-y-4">
      <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-black/10 sm:h-40">
        <Image
          src={headerImageUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <MabarDetailTabs
        detailTab={detailTab}
        playersTab={playersTab}
        matchmakingTab={matchmakingTab}
        rankingTab={rankingTab}
        playersCount={joined.length + waitlist.length}
        showMatchmakingTab={checkInEnabled && (joined.length > 0 || isAdmin)}
      />
    </div>
  );
}
