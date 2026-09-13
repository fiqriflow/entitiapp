-- ============================================
-- Entiti Badminton Ciamis — Hapus Akun jadi Anonymize
-- Jalankan di Supabase SQL Editor
-- (menggantikan fungsi delete_own_account dari schema_21)
-- ============================================

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Kosongkan/generic-kan data pribadi, tapi baris players TETAP ADA
  -- supaya histori mabar/pertandingan pemain lain yang pernah main
  -- bareng dia tidak ikut rusak.
  update public.players
  set full_name = 'Pemain Terhapus',
      nickname = null,
      whatsapp = null,
      instagram = null,
      avatar_url = null,
      email = null,
      role = 'member',
      auth_user_id = null
  where auth_user_id = auth.uid();

  -- Hapus akun auth-nya supaya tidak bisa login lagi
  delete from auth.users where id = auth.uid();
end;
$$;
