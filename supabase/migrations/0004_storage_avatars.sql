-- ============================================
-- Entiti Badminton Ciamis — Storage bucket untuk avatar
-- Jalankan di Supabase SQL Editor
-- ============================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Semua orang boleh lihat avatar (bucket public untuk read)
create policy "avatars_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- User cuma boleh upload/update/hapus file di folder miliknya sendiri
-- (path harus diawali dengan auth.uid() mereka, contoh: <uid>/avatar.jpg)
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
