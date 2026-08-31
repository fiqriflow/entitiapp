-- ============================================
-- Entiti Badminton Ciamis — Override manual status Selesai
-- Jalankan di Supabase SQL Editor
-- ============================================

alter table public.mabar_events
  add column if not exists completion_override text
  check (completion_override in ('selesai', 'belum'));
-- null = otomatis ikut tanggal (default)
-- 'selesai' = paksa masuk tab Selesai walau tanggalnya belum lewat
-- 'belum' = paksa tetap di Mabar Aktif walau tanggalnya sudah lewat
