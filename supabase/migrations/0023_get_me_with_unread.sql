-- Gabung query "players" (data profil) + count unread notifications
-- jadi 1 round-trip DB, dipakai di app/(main)/layout.tsx tiap pindah menu.
create or replace function get_me_with_unread(p_auth_user_id uuid)
returns table (
  id uuid,
  nickname text,
  full_name text,
  avatar_url text,
  whatsapp text,
  gender text,
  instagram text,
  unread_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.nickname,
    p.full_name,
    p.avatar_url,
    p.whatsapp,
    p.gender,
    p.instagram,
    (
      select count(*)
      from notifications n
      where n.player_id = p.id and n.is_read = false
    ) as unread_count
  from players p
  where p.auth_user_id = p_auth_user_id;
$$;

grant execute on function get_me_with_unread(uuid) to authenticated;
