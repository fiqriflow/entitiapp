-- ============================================
-- Entiti Badminton Ciamis — Check-in Peserta Mabar
-- Jalankan di Supabase SQL Editor
-- ============================================

alter table public.mabar_participants
  add column if not exists checked_in boolean not null default false,
  add column if not exists checked_in_at timestamptz;
