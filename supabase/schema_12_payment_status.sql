-- ============================================
-- Entiti Badminton Ciamis — Status Pembayaran Mabar
-- Jalankan di Supabase SQL Editor
-- ============================================

alter table public.mabar_participants
  add column if not exists is_paid boolean not null default false;
