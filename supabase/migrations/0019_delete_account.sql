-- ============================================
-- Entiti Badminton Ciamis — Hapus Akun Sendiri
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Fungsi ini jalan dengan hak akses tinggi (security definer) supaya
-- bisa menghapus baris di auth.users milik diri sendiri, sesuatu yang
-- normalnya tidak diizinkan lewat client biasa.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Hapus data pemain dulu (otomatis ikut hapus riwayat mabar,
  -- peserta, dan hasil pertandingan karena foreign key cascade)
  delete from public.players where auth_user_id = auth.uid();

  -- Hapus akun auth-nya juga, supaya tidak bisa login lagi
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
