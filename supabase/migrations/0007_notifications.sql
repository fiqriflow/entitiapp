-- ============================================
-- Entiti Badminton Ciamis — Notifikasi
-- Jalankan di Supabase SQL Editor
-- (butuh public.is_admin() dari schema_04_fix_recursion.sql)
-- ============================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_player_id_created_at_idx
  on public.notifications (player_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (
    player_id in (select id from public.players where auth_user_id = auth.uid())
  );

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (
    player_id in (select id from public.players where auth_user_id = auth.uid())
  );

create policy "notifications_admin_all"
  on public.notifications for all
  to authenticated
  using (public.is_admin());

-- Flag di mabar_events supaya reminder H-1 & H-1jam cuma terkirim sekali
alter table public.mabar_events
  add column if not exists reminder_day_sent boolean not null default false;
alter table public.mabar_events
  add column if not exists reminder_today_sent boolean not null default false;

-- --------------------------------------------
-- 1. Notifikasi: ada mabar baru aktif
-- --------------------------------------------
create or replace function public.fn_notify_new_mabar()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'active' then
    insert into public.notifications (player_id, type, title, body, link_url)
    select
      p.id,
      'mabar_baru',
      'Mabar Baru!',
      new.title || ' sudah dibuka, yuk gabung sebelum penuh!',
      '/mabar/' || new.id
    from public.players p
    where p.auth_user_id is not null
      and (new.created_by is null or p.id != new.created_by);
  end if;
  return new;
end;
$$;

drop trigger if exists on_mabar_event_created on public.mabar_events;
create trigger on_mabar_event_created
  after insert on public.mabar_events
  for each row execute function public.fn_notify_new_mabar();

-- --------------------------------------------
-- 2. Notifikasi: perubahan status peserta
--    (waitlist -> joined, pending -> joined/approved)
-- --------------------------------------------
create or replace function public.fn_notify_participant_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  event_title text;
begin
  if new.status is distinct from old.status and new.status = 'joined' then
    select title into event_title from public.mabar_events where id = new.mabar_id;

    if old.status = 'waitlist' then
      insert into public.notifications (player_id, type, title, body, link_url)
      values (
        new.player_id,
        'waitlist_promoted',
        'Kamu resmi jadi peserta!',
        'Kamu naik dari waitlist ke peserta tetap di ' || coalesce(event_title, 'mabar') || '.',
        '/mabar/' || new.mabar_id
      );
    elsif old.status = 'pending' then
      insert into public.notifications (player_id, type, title, body, link_url)
      values (
        new.player_id,
        'mabar_approved',
        'Permintaan Join Disetujui',
        'Admin menyetujui permintaan join kamu di ' || coalesce(event_title, 'mabar') || '.',
        '/mabar/' || new.mabar_id
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_participant_status_change on public.mabar_participants;
create trigger on_participant_status_change
  after update on public.mabar_participants
  for each row execute function public.fn_notify_participant_status_change();

-- --------------------------------------------
-- 3. Notifikasi ke admin: ada yang join/ajukan mabar
-- --------------------------------------------
create or replace function public.fn_notify_admin_new_participant()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  event_title text;
  player_name text;
  action_word text;
begin
  select title into event_title from public.mabar_events where id = new.mabar_id;
  select coalesce(nickname, full_name, 'Seseorang') into player_name
    from public.players where id = new.player_id;

  action_word := case
    when new.status = 'pending' then 'mengajukan join ke'
    else 'bergabung ke'
  end;

  insert into public.notifications (player_id, type, title, body, link_url)
  select
    p.id,
    'peserta_baru',
    'Peserta Baru',
    player_name || ' ' || action_word || ' mabar ' || coalesce(event_title, '') || '.',
    '/mabar/' || new.mabar_id
  from public.players p
  where p.role = 'admin' and p.id != new.player_id;

  return new;
end;
$$;

drop trigger if exists on_participant_created on public.mabar_participants;
create trigger on_participant_created
  after insert on public.mabar_participants
  for each row execute function public.fn_notify_admin_new_participant();

-- --------------------------------------------
-- 4. Reminder H-1 hari & H-1 jam sebelum mabar
--    (dipanggil berkala lewat pg_cron, lihat bagian bawah)
-- --------------------------------------------
create or replace function public.send_mabar_reminders()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  ev record;
begin
  -- Reminder H-1 hari (jendela 23-25 jam sebelum mulai)
  for ev in
    select * from public.mabar_events
    where status = 'active'
      and reminder_day_sent = false
      and (event_date + start_time) - now() between interval '23 hours' and interval '25 hours'
  loop
    insert into public.notifications (player_id, type, title, body, link_url)
    select
      mp.player_id,
      'reminder_h1',
      'Mabar Besok!',
      ev.title || ' besok jam ' || to_char(ev.start_time, 'HH24:MI') || ', jangan lupa datang ya!',
      '/mabar/' || ev.id
    from public.mabar_participants mp
    where mp.mabar_id = ev.id and mp.status = 'joined';

    update public.mabar_events set reminder_day_sent = true where id = ev.id;
  end loop;

  -- Reminder H (hari ini juga ada mabar) — dikirim sekali di hari-H
  for ev in
    select * from public.mabar_events
    where status = 'active'
      and reminder_today_sent = false
      and event_date = current_date
  loop
    insert into public.notifications (player_id, type, title, body, link_url)
    select
      mp.player_id,
      'reminder_hari_ini',
      'Mabar Hari Ini!',
      ev.title || ' hari ini jam ' || to_char(ev.start_time, 'HH24:MI') || ', sampai ketemu di lapangan!',
      '/mabar/' || ev.id
    from public.mabar_participants mp
    where mp.mabar_id = ev.id and mp.status = 'joined';

    update public.mabar_events set reminder_today_sent = true where id = ev.id;
  end loop;
end;
$$;

-- --------------------------------------------
-- Jadwalkan reminder jalan tiap 15 menit lewat pg_cron.
-- WAJIB: aktifkan dulu extension "pg_cron" di
-- Supabase Dashboard -> Database -> Extensions, BARU jalankan baris ini.
-- --------------------------------------------
select cron.schedule(
  'mabar-reminders',
  '*/15 * * * *',
  $$select public.send_mabar_reminders();$$
);
