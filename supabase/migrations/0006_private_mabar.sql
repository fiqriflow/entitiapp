-- ============================================
-- Entiti Badminton Ciamis — Mabar Privat (butuh approval admin)
-- Jalankan di Supabase SQL Editor
-- ============================================

alter table public.mabar_events
  add column if not exists is_private boolean not null default false;

-- Tambah status "pending" untuk mabar privat (join butuh approval admin
-- dulu sebelum resmi jadi "joined")
alter table public.mabar_participants
  drop constraint if exists mabar_participants_status_check;

alter table public.mabar_participants
  add constraint mabar_participants_status_check
  check (status in ('joined', 'waitlist', 'pending'));
