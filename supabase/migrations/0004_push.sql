-- ============================================================================
-- Notifications push : abonnements des visiteurs
-- À exécuter dans Supabase > SQL Editor.
-- ============================================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- N'importe quel visiteur peut s'abonner (insertion seulement)...
drop policy if exists "push_insert_public" on public.push_subscriptions;
create policy "push_insert_public" on public.push_subscriptions
  for insert with check (true);

-- ...mais seul l'administrateur peut lire la liste ou la nettoyer.
drop policy if exists "push_admin_all" on public.push_subscriptions;
create policy "push_admin_all" on public.push_subscriptions
  for all using (public.is_admin()) with check (public.is_admin());
