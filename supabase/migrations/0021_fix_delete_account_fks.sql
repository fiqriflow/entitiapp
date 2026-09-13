-- ============================================
-- Entiti Badminton Ciamis — Fix: Hapus Akun gagal karena FK constraint
-- Jalankan di Supabase SQL Editor
-- ============================================

-- mabar_matches: kalau pemain dihapus, baris match yang melibatkan dia
-- ikut terhapus (konsisten dengan mabar_participants yang sudah cascade).
-- Catatan: karena satu baris match berisi 4 pemain, menghapus 1 pemain
-- akan menghapus juga histori match itu untuk 3 pemain lain di match yang sama.
alter table public.mabar_matches drop constraint if exists mabar_matches_team_a_player1_fkey;
alter table public.mabar_matches add constraint mabar_matches_team_a_player1_fkey
  foreign key (team_a_player1) references public.players (id) on delete cascade;

alter table public.mabar_matches drop constraint if exists mabar_matches_team_a_player2_fkey;
alter table public.mabar_matches add constraint mabar_matches_team_a_player2_fkey
  foreign key (team_a_player2) references public.players (id) on delete cascade;

alter table public.mabar_matches drop constraint if exists mabar_matches_team_b_player1_fkey;
alter table public.mabar_matches add constraint mabar_matches_team_b_player1_fkey
  foreign key (team_b_player1) references public.players (id) on delete cascade;

alter table public.mabar_matches drop constraint if exists mabar_matches_team_b_player2_fkey;
alter table public.mabar_matches add constraint mabar_matches_team_b_player2_fkey
  foreign key (team_b_player2) references public.players (id) on delete cascade;

-- Kolom created_by di berbagai tabel cuma buat audit trail (nullable),
-- jadi kalau pemain (biasanya admin) yang bikin konten itu dihapus,
-- cukup di-null-kan aja, bukan blokir penghapusan atau ikut hapus kontennya.
alter table public.mabar_events drop constraint if exists mabar_events_created_by_fkey;
alter table public.mabar_events add constraint mabar_events_created_by_fkey
  foreign key (created_by) references public.players (id) on delete set null;

alter table public.announcements drop constraint if exists announcements_created_by_fkey;
alter table public.announcements add constraint announcements_created_by_fkey
  foreign key (created_by) references public.players (id) on delete set null;

alter table public.hero_banners drop constraint if exists hero_banners_created_by_fkey;
alter table public.hero_banners add constraint hero_banners_created_by_fkey
  foreign key (created_by) references public.players (id) on delete set null;

alter table public.mabar_templates drop constraint if exists mabar_templates_created_by_fkey;
alter table public.mabar_templates add constraint mabar_templates_created_by_fkey
  foreign key (created_by) references public.players (id) on delete set null;

alter table public.avatar_presets drop constraint if exists avatar_presets_created_by_fkey;
alter table public.avatar_presets add constraint avatar_presets_created_by_fkey
  foreign key (created_by) references public.players (id) on delete set null;

alter table public.commitment_items drop constraint if exists commitment_items_created_by_fkey;
alter table public.commitment_items add constraint commitment_items_created_by_fkey
  foreign key (created_by) references public.players (id) on delete set null;
