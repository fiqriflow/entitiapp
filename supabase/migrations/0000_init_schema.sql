-- ============================================
-- Entiti Badminton Ciamis — Schema
-- Jalankan SEMUA isi file ini di Supabase SQL Editor
-- (aman dijalankan ulang / drop dulu kalau reset dari awal)
-- ============================================

drop table if exists public.mabar_participants cascade;
drop table if exists public.mabar_events cascade;
drop table if exists public.players cascade;

-- --------------------------------------------
-- players
-- id = primary key milik app (bukan auth id) supaya admin bisa
-- pre-daftarkan pemain sebelum orangnya login.
-- auth_user_id ke-isi otomatis saat orang login pakai Google dengan
-- email yang cocok (lihat trigger handle_new_user di bawah).
-- --------------------------------------------
create table public.players (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  email text,
  full_name text,
  nickname text,
  whatsapp text,
  level text check (level in ('newbie', 'beginner', 'intermediate', 'advance')) default 'newbie',
  gender text check (gender in ('pria', 'wanita')),
  instagram text,
  avatar_url text,
  role text check (role in ('member', 'admin')) not null default 'member',
  created_at timestamptz not null default now()
);

alter table public.players enable row level security;

-- Fungsi ini boleh baca tabel players TANPA kena RLS (security definer),
-- jadi aman dipakai di dalam policy tanpa memicu policy itu sendiri lagi
-- (kalau pakai "exists (select ... from players)" langsung di policy
-- players, itu akan infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.players p
    where p.auth_user_id = auth.uid() and p.role = 'admin'
  );
$$;

create policy "players_select_authenticated"
  on public.players for select
  to authenticated
  using (true);

create policy "players_update_own"
  on public.players for update
  to authenticated
  using (auth.uid() = auth_user_id);

create policy "players_insert_own"
  on public.players for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

create policy "players_admin_all"
  on public.players for all
  to authenticated
  using (
    public.is_admin()
  );

-- Trigger: saat user baru login via Google —
-- kalau emailnya sudah pernah didaftarkan admin, tinggal di-link;
-- kalau belum ada, buat baris baru otomatis.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  existing_id uuid;
begin
  select id into existing_id
  from public.players
  where lower(email) = lower(new.email) and auth_user_id is null
  limit 1;

  if existing_id is not null then
    update public.players
    set auth_user_id = new.id,
        avatar_url = coalesce(avatar_url, new.raw_user_meta_data ->> 'avatar_url'),
        full_name = coalesce(full_name, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
        nickname = coalesce(nickname, new.raw_user_meta_data ->> 'nickname')
    where id = existing_id;
  else
    insert into public.players (auth_user_id, email, full_name, nickname, avatar_url)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
      new.raw_user_meta_data ->> 'nickname',
      new.raw_user_meta_data ->> 'avatar_url'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------
-- mabar_events
-- --------------------------------------------
create table public.mabar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_date date not null,
  start_time time not null,
  end_time time,
  max_slot integer not null default 10,
  price integer not null default 0,
  status text check (status in ('active', 'closed')) not null default 'active',
  is_private boolean not null default false,
  completion_override text check (completion_override in ('selesai', 'belum')),
  level_min text not null default 'newbie' check (level_min in ('newbie', 'beginner', 'intermediate', 'advance')),
  level_max text not null default 'advance' check (level_max in ('newbie', 'beginner', 'intermediate', 'advance')),
  gender_restriction text check (gender_restriction in ('pria', 'wanita')),
  level_min text not null default 'newbie' check (level_min in ('newbie', 'beginner', 'intermediate', 'advance')),
  level_max text not null default 'advance' check (level_max in ('newbie', 'beginner', 'intermediate', 'advance')),
  banner_url text,
  created_by uuid references public.players (id),
  created_at timestamptz not null default now()
);

alter table public.mabar_events enable row level security;

create policy "mabar_events_select_authenticated"
  on public.mabar_events for select
  to authenticated
  using (true);

create policy "mabar_events_admin_all"
  on public.mabar_events for all
  to authenticated
  using (
    public.is_admin()
  );

-- --------------------------------------------
-- mabar_participants
-- --------------------------------------------
create table public.mabar_participants (
  id uuid primary key default gen_random_uuid(),
  mabar_id uuid not null references public.mabar_events (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  status text check (status in ('joined', 'waitlist', 'pending')) not null default 'joined',
  is_paid boolean not null default false,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  joined_at timestamptz not null default now(),
  unique (mabar_id, player_id)
);

alter table public.mabar_participants enable row level security;

create policy "mabar_participants_select_authenticated"
  on public.mabar_participants for select
  to authenticated
  using (true);

create policy "mabar_participants_insert_own"
  on public.mabar_participants for insert
  to authenticated
  with check (
    player_id in (select id from public.players where auth_user_id = auth.uid())
  );

create policy "mabar_participants_delete_own"
  on public.mabar_participants for delete
  to authenticated
  using (
    player_id in (select id from public.players where auth_user_id = auth.uid())
  );

create policy "mabar_participants_admin_all"
  on public.mabar_participants for all
  to authenticated
  using (
    public.is_admin()
  );

-- --------------------------------------------
-- Jadikan diri kamu admin pertama:
-- ganti email di bawah dengan email Google kamu, lalu jalankan
-- baris ini SETELAH kamu pernah login sekali via Google.
-- --------------------------------------------
-- update public.players set role = 'admin' where email = 'emailkamu@gmail.com';

-- --------------------------------------------
-- mabar_sessions & mabar_matches (Matchmaking Americano)
-- --------------------------------------------
create table if not exists public.mabar_sessions (
  id uuid primary key default gen_random_uuid(),
  mabar_id uuid not null references public.mabar_events (id) on delete cascade,
  round_number integer not null,
  created_at timestamptz not null default now()
);

alter table public.mabar_sessions enable row level security;

create policy "mabar_sessions_select_authenticated"
  on public.mabar_sessions for select
  to authenticated
  using (true);

create policy "mabar_sessions_admin_all"
  on public.mabar_sessions for all
  to authenticated
  using (public.is_admin());

create table if not exists public.mabar_matches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mabar_sessions (id) on delete cascade,
  mabar_id uuid not null references public.mabar_events (id) on delete cascade,
  court_label text not null default 'Lapangan 1',
  team_a_player1 uuid not null references public.players (id),
  team_a_player2 uuid not null references public.players (id),
  team_b_player1 uuid not null references public.players (id),
  team_b_player2 uuid not null references public.players (id),
  score_a integer,
  score_b integer,
  sets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.mabar_matches enable row level security;

create policy "mabar_matches_select_authenticated"
  on public.mabar_matches for select
  to authenticated
  using (true);

create policy "mabar_matches_admin_all"
  on public.mabar_matches for all
  to authenticated
  using (public.is_admin());


-- --------------------------------------------
-- mabar_templates (Template Mabar Rutin)
-- --------------------------------------------
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
  created_by uuid references public.players (id),
  created_at timestamptz not null default now()
);

alter table public.mabar_templates enable row level security;

create policy "mabar_templates_select_authenticated"
  on public.mabar_templates for select
  to authenticated
  using (true);

create policy "mabar_templates_admin_all"
  on public.mabar_templates for all
  to authenticated
  using (public.is_admin());
