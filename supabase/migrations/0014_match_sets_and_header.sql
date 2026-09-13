-- ============================================
-- Entiti Badminton Ciamis — Skor 3 Set & Header Mabar Custom
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Skor per match jadi array set (maks 3), bukan cuma 1 skor
alter table public.mabar_matches
  add column if not exists sets jsonb not null default '[]'::jsonb;

-- Migrasi data lama (kalau ada skor 1-set) jadi format set pertama
update public.mabar_matches
set sets = jsonb_build_array(jsonb_build_object('a', score_a, 'b', score_b))
where score_a is not null and score_b is not null and sets = '[]'::jsonb;

-- 2. Header banner bisa dipakai untuk 2 tempat: Beranda atau Detail Mabar
alter table public.hero_banners
  add column if not exists purpose text not null default 'beranda'
  check (purpose in ('beranda', 'mabar_detail'));
