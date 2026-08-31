-- ============================================
-- Entiti Badminton Ciamis — Checklist Komitmen Sebelum Join
-- Jalankan di Supabase SQL Editor
-- (butuh fungsi public.is_admin() dari schema_04_fix_recursion.sql)
-- ============================================

create table if not exists public.commitment_items (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.players (id),
  created_at timestamptz not null default now()
);

alter table public.commitment_items enable row level security;

create policy "commitment_items_select_authenticated"
  on public.commitment_items for select
  to authenticated
  using (true);

create policy "commitment_items_admin_all"
  on public.commitment_items for all
  to authenticated
  using (public.is_admin());
