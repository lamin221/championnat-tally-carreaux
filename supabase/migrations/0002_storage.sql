-- ============================================================================
-- STORAGE : buckets pour logos, photos joueurs, galerie (photos/vidéos)
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('team-logos', 'team-logos', true),
  ('player-photos', 'player-photos', true),
  ('gallery', 'gallery', true),
  ('news-covers', 'news-covers', true)
on conflict (id) do nothing;

-- Lecture publique pour tous les buckets
create policy "public_read_team_logos" on storage.objects
  for select using (bucket_id = 'team-logos');
create policy "public_read_player_photos" on storage.objects
  for select using (bucket_id = 'player-photos');
create policy "public_read_gallery" on storage.objects
  for select using (bucket_id = 'gallery');
create policy "public_read_news_covers" on storage.objects
  for select using (bucket_id = 'news-covers');

-- Écriture réservée aux admins connectés
create policy "admin_write_team_logos" on storage.objects
  for insert with check (bucket_id = 'team-logos' and public.is_admin());
create policy "admin_update_team_logos" on storage.objects
  for update using (bucket_id = 'team-logos' and public.is_admin());
create policy "admin_delete_team_logos" on storage.objects
  for delete using (bucket_id = 'team-logos' and public.is_admin());

create policy "admin_write_player_photos" on storage.objects
  for insert with check (bucket_id = 'player-photos' and public.is_admin());
create policy "admin_update_player_photos" on storage.objects
  for update using (bucket_id = 'player-photos' and public.is_admin());
create policy "admin_delete_player_photos" on storage.objects
  for delete using (bucket_id = 'player-photos' and public.is_admin());

create policy "admin_write_gallery" on storage.objects
  for insert with check (bucket_id = 'gallery' and public.is_admin());
create policy "admin_update_gallery" on storage.objects
  for update using (bucket_id = 'gallery' and public.is_admin());
create policy "admin_delete_gallery" on storage.objects
  for delete using (bucket_id = 'gallery' and public.is_admin());

create policy "admin_write_news_covers" on storage.objects
  for insert with check (bucket_id = 'news-covers' and public.is_admin());
create policy "admin_update_news_covers" on storage.objects
  for update using (bucket_id = 'news-covers' and public.is_admin());
create policy "admin_delete_news_covers" on storage.objects
  for delete using (bucket_id = 'news-covers' and public.is_admin());
