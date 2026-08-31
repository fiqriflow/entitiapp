-- ============================================
-- Entiti Badminton Ciamis — Matchmaking Americano & Skor
-- Jalankan di Supabase SQL Editor
-- (butuh fungsi public.is_admin() dari schema_04_fix_recursion.sql)
-- ============================================

create table if not exists public.mabar_sessions (
  id uuid primary key default gen_random_uuid(),
  mabar_id uuid not null references public.mabar_events (id) on delete cascade,
  round_number integer not null,
  created_at timestamptz not null default now()
);

alter table public.mabar_sessions enable row level security;

create policy "mabar_sessions_select_authenticated"
  on public.mabar_sessions for select
  to authenticated
  using (true);

create policy "mabar_sessions_admin_all"
  on public.mabar_sessions for all
  to authenticated
  using (public.is_admin());

create table if not exists public.mabar_matches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mabar_sessions (id) on delete cascade,
  mabar_id uuid not null references public.mabar_events (id) on delete cascade,
  court_label text not null default 'Lapangan 1',
  team_a_player1 uuid not null references public.players (id),
  team_a_player2 uuid not null references public.players (id),
  team_b_player1 uuid not null references public.players (id),
  team_b_player2 uuid not null references public.players (id),
  score_a integer,
  score_b integer,
  created_at timestamptz not null default now()
);

alter table public.mabar_matches enable row level security;

create policy "mabar_matches_select_authenticated"
  on public.mabar_matches for select
  to authenticated
  using (true);

create policy "mabar_matches_admin_all"
  on public.mabar_matches for all
  to authenticated
  using (public.is_admin());
