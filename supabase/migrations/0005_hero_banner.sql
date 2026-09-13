-- ============================================
-- Entiti Badminton Ciamis — Hero Banner
-- Jalankan di Supabase SQL Editor
-- (butuh fungsi public.is_admin() dari schema_04_fix_recursion.sql)
-- ============================================

create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.players (id),
  created_at timestamptz not null default now()
);

alter table public.hero_banners enable row level security;

create policy "hero_banners_select_authenticated"
  on public.hero_banners for select
  to authenticated
  using (true);

create policy "hero_banners_admin_all"
  on public.hero_banners for all
  to authenticated
  using (public.is_admin());

-- Storage bucket khusus gambar banner (beda dari avatars —
-- di sini cuma admin yang boleh upload/hapus)
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "banners_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'banners');

create policy "banners_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'banners' and public.is_admin());

create policy "banners_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'banners' and public.is_admin());

create policy "banners_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'banners' and public.is_admin());
