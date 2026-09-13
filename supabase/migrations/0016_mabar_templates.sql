-- ============================================
-- Entiti Badminton Ciamis — Template Mabar
-- Jalankan di Supabase SQL Editor
-- (butuh fungsi public.is_admin() dari schema_04_fix_recursion.sql)
-- ============================================

create table if not exists public.mabar_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  description text,
  location text,
  start_time time not null,
  end_time time,
  max_slot integer not null default 10,
  price integer not null default 0,
  is_private boolean not null default false,
  level_min text not null default 'newbie'
    check (level_min in ('newbie', 'beginner', 'intermediate', 'advance')),
  level_max text not null default 'advance'
    check (level_max in ('newbie', 'beginner', 'intermediate', 'advance')),
  gender_restriction text check (gender_restriction in ('pria', 'wanita')),
  created_by uuid references public.players (id),
  created_at timestamptz not null default now()
);

alter table public.mabar_templates enable row level security;

create policy "mabar_templates_admin_all"
  on public.mabar_templates for all
  to authenticated
  using (public.is_admin());
