-- ============================================
-- Entiti Badminton Ciamis — Izinkan user insert baris
-- players miliknya sendiri (untuk self-heal kalau baris
-- kehapus tapi akun auth-nya masih ada)
-- Jalankan di Supabase SQL Editor
-- ============================================

create policy "players_insert_own"
  on public.players for insert
  to authenticated
  with check (auth.uid() = auth_user_id);
