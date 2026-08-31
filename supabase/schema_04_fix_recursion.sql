-- ============================================
-- Entiti Badminton Ciamis — Fix: infinite recursion RLS
-- Jalankan di Supabase SQL Editor setelah schema.sql,
-- schema_03_announcements.sql
-- ============================================

-- Fungsi ini boleh baca tabel players TANPA kena RLS
-- (security definer), jadi aman dipakai di dalam policy
-- tanpa memicu policy itu sendiri lagi (infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.players p
    where p.auth_user_id = auth.uid() and p.role = 'admin'
  );
$$;

-- players
drop policy if exists "players_admin_all" on public.players;
create policy "players_admin_all"
  on public.players for all
  to authenticated
  using (public.is_admin());

-- mabar_events
drop policy if exists "mabar_events_admin_all" on public.mabar_events;
create policy "mabar_events_admin_all"
  on public.mabar_events for all
  to authenticated
  using (public.is_admin());

-- mabar_participants
drop policy if exists "mabar_participants_admin_all" on public.mabar_participants;
create policy "mabar_participants_admin_all"
  on public.mabar_participants for all
  to authenticated
  using (public.is_admin());

-- announcements (kalau sudah dijalankan schema_03)
drop policy if exists "announcements_admin_all" on public.announcements;
create policy "announcements_admin_all"
  on public.announcements for all
  to authenticated
  using (public.is_admin());
