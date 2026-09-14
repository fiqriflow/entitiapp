-- Kolom girl_balance dipakai di kode admin mabar (form, actions, template)
-- tapi kelewat gak ada migrasinya -> select "girl_balance" error karena
-- kolom belum ada di DB -> list mabar_events & mabar_templates jadi kosong
-- total di admin panel.
alter table public.mabar_events
  add column if not exists girl_balance boolean not null default false;

alter table public.mabar_templates
  add column if not exists girl_balance boolean not null default false;
