-- ============================================
-- Entiti Badminton Ciamis — Harga Mabar & Level baru
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Harga mabar (rupiah, 0 = gratis)
alter table public.mabar_events
  add column if not exists price integer not null default 0;

-- 2. Ganti level pemain jadi 4 tier: newbie, beginner, intermediate, advance
alter table public.players
  drop constraint if exists players_level_check;

-- Migrasi data lama ke tier baru dulu, baru pasang constraint baru
update public.players set level = 'newbie' where level = 'pemula';
update public.players set level = 'intermediate' where level = 'menengah';
update public.players set level = 'advance' where level = 'mahir';

alter table public.players
  add constraint players_level_check
  check (level in ('newbie', 'beginner', 'intermediate', 'advance'));

alter table public.players alter column level set default 'newbie';
