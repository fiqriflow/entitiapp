-- ============================================
-- Entiti Badminton Ciamis — Batasan Level & Gender Mabar
-- Jalankan di Supabase SQL Editor
-- ============================================

alter table public.mabar_events
  add column if not exists level_min text not null default 'newbie'
    check (level_min in ('newbie', 'beginner', 'intermediate', 'advance')),
  add column if not exists level_max text not null default 'advance'
    check (level_max in ('newbie', 'beginner', 'intermediate', 'advance')),
  add column if not exists gender_restriction text
    check (gender_restriction in ('pria', 'wanita'));
-- gender_restriction null = terbuka untuk semua gender
