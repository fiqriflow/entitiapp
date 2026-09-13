-- ============================================
-- Entiti Badminton Ciamis — Login Nickname & Password
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Update trigger auto-buat profil: sekarang juga ambil nickname dari
-- signup metadata (dipakai saat sign up via nickname & password,
-- bukan cuma Google)
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
