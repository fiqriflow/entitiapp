-- ============================================
-- Entiti Badminton Ciamis — Schema step 3 (Pengumuman)
-- Jalankan di Supabase SQL Editor setelah schema.sql
-- (butuh fungsi public.is_admin() yang sudah ada di schema.sql)
-- ============================================

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  is_active boolean not null default true,
  created_by uuid references public.players (id),
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "announcements_select_authenticated"
  on public.announcements for select
  to authenticated
  using (true);

create policy "announcements_admin_all"
  on public.announcements for all
  to authenticated
  using (public.is_admin());

-- Contoh data (opsional, hapus/ubah sesuai kebutuhan):
-- insert into public.announcements (title, content) values
--   ('Selamat datang!', 'Selamat bergabung di komunitas Entiti Badminton Ciamis 🏸');
