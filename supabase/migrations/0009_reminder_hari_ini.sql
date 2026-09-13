-- ============================================
-- Entiti Badminton Ciamis — Ganti reminder H-1jam jadi H-hari (hari ini)
-- Jalankan di Supabase SQL Editor
-- ============================================

alter table public.mabar_events
  add column if not exists reminder_today_sent boolean not null default false;

alter table public.mabar_events
  drop column if exists reminder_hour_sent;

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

  -- Reminder H (hari ini juga ada mabar) — dikirim sekali di hari-H,
  -- tertangkap oleh run cron pertama setelah tengah malam hari itu
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
