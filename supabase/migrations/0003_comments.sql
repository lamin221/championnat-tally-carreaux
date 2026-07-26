-- ============================================================================
-- COMMENTAIRES SUR LES MATCHS
-- Ouverts à tous les visiteurs (nom + texte, sans compte), publication immédiate.
-- Seul l'admin peut supprimer un commentaire (modération a posteriori).
-- ============================================================================

create table public.match_comments (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint author_name_length check (char_length(author_name) between 1 and 60),
  constraint content_length check (char_length(content) between 1 and 500)
);

create index idx_match_comments_match on public.match_comments(match_id);

alter table public.match_comments enable row level security;

-- Lecture publique
create policy "match_comments_public_read" on public.match_comments
  for select using (true);

-- Écriture publique (n'importe quel visiteur peut poster, sans compte)
create policy "match_comments_public_insert" on public.match_comments
  for insert with check (true);

-- Seul l'admin peut supprimer (modération a posteriori)
create policy "match_comments_admin_delete" on public.match_comments
  for delete using (public.is_admin());

-- Realtime, pour que les nouveaux commentaires apparaissent sans recharger la page
alter publication supabase_realtime add table public.match_comments;
