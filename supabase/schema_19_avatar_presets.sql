-- ============================================
-- Entiti Badminton Ciamis — CRUD Avatar Preset (Admin)
-- Jalankan di Supabase SQL Editor
-- (butuh fungsi public.is_admin() dari schema_04_fix_recursion.sql)
-- ============================================

create table if not exists public.avatar_presets (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.players (id),
  created_at timestamptz not null default now()
);

alter table public.avatar_presets enable row level security;

create policy "avatar_presets_select_authenticated"
  on public.avatar_presets for select
  to authenticated
  using (true);

create policy "avatar_presets_admin_all"
  on public.avatar_presets for all
  to authenticated
  using (public.is_admin());

-- Storage bucket khusus gambar avatar preset (cuma admin yang boleh upload)
insert into storage.buckets (id, name, public)
values ('avatar-presets', 'avatar-presets', true)
on conflict (id) do nothing;

create policy "avatar_presets_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatar-presets');

create policy "avatar_presets_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatar-presets' and public.is_admin());

create policy "avatar_presets_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatar-presets' and public.is_admin());

create policy "avatar_presets_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatar-presets' and public.is_admin());

-- Seed 10 avatar default yang sudah ada (ikon raket warna-warni)
insert into public.avatar_presets (image_url, sort_order)
values
  ('/avatars/avatar-1.svg', 0),
  ('/avatars/avatar-2.svg', 1),
  ('/avatars/avatar-3.svg', 2),
  ('/avatars/avatar-4.svg', 3),
  ('/avatars/avatar-5.svg', 4),
  ('/avatars/avatar-6.svg', 5),
  ('/avatars/avatar-7.svg', 6),
  ('/avatars/avatar-8.svg', 7),
  ('/avatars/avatar-9.svg', 8),
  ('/avatars/avatar-10.svg', 9)
on conflict do nothing;
