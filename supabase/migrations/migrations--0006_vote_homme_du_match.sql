-- ============================================================================
-- Vote du public pour l'homme du match.
-- À exécuter dans Supabase > SQL Editor (après 0005_pronostics.sql).
--
-- Réutilise les pseudos des pronostics (table predictors). Les visiteurs votent
-- après la fin du match, pendant 72 heures à partir du coup d'envoi.
-- L'« homme du match » officiel reste celui que tu choisis dans l'admin :
-- le public a son propre « choix des supporters ».
-- Les tables sont fermées au public : tout passe par les fonctions ci-dessous.
-- ============================================================================

create table if not exists public.motm_votes (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  predictor_id uuid not null references public.predictors(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, predictor_id)
);
create index if not exists motm_votes_match_idx on public.motm_votes (match_id);

alter table public.motm_votes enable row level security;

drop policy if exists "motm_votes_admin_all" on public.motm_votes;
create policy "motm_votes_admin_all" on public.motm_votes
  for all using (public.is_admin()) with check (public.is_admin());

-- Le vote est-il ouvert ? (match terminé, moins de 72 h après le coup d'envoi, heure UTC+0)
-- Pour changer la durée, modifie « 72 hours » ici ET FENETRE_VOTE_HEURES dans src/lib/vote.ts.
create or replace function public.motm_vote_open(p_match uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select m.status = 'termine'
        and (m.match_date + coalesce(m.match_time, time '00:00')) + interval '72 hours' > (now() at time zone 'utc')
      from matches m
      where m.id = p_match
    ),
    false
  );
$$;

-- Enregistre (ou modifie) un vote.
create or replace function public.submit_motm_vote(p_predictor uuid, p_match uuid, p_player uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match matches%rowtype;
  v_composition boolean;
  v_eligible boolean;
begin
  if not exists (select 1 from predictors where id = p_predictor) then
    raise exception 'predicteur_inconnu';
  end if;

  select * into v_match from matches where id = p_match;
  if not found then
    raise exception 'match_inconnu';
  end if;
  if v_match.status <> 'termine' then
    raise exception 'match_non_termine';
  end if;
  if not motm_vote_open(p_match) then
    raise exception 'vote_ferme';
  end if;

  -- Joueurs votables : la composition du match si elle est saisie, sinon les deux effectifs
  select exists (select 1 from match_lineups where match_id = p_match) into v_composition;
  if v_composition then
    v_eligible := exists (select 1 from match_lineups where match_id = p_match and player_id = p_player);
  else
    v_eligible := exists (
      select 1 from players
      where id = p_player and team_id in (v_match.home_team_id, v_match.away_team_id)
    );
  end if;
  if not v_eligible then
    raise exception 'joueur_non_eligible';
  end if;

  insert into motm_votes (match_id, predictor_id, player_id)
  values (p_match, p_predictor, p_player)
  on conflict (match_id, predictor_id) do update
    set player_id = excluded.player_id, updated_at = now();
end;
$$;

-- Les votes d'un visiteur (identifiant secret requis).
create or replace function public.my_motm_votes(p_predictor uuid)
returns table (match_id uuid, player_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select match_id, player_id from motm_votes where predictor_id = p_predictor;
$$;

-- Nombre de votes par joueur et par match (aucun identifiant de votant exposé)
create or replace view public.motm_vote_counts as
select match_id, player_id, count(*)::int as votes
from public.motm_votes
group by match_id, player_id;

grant select on public.motm_vote_counts to anon, authenticated;
grant execute on function public.motm_vote_open(uuid) to anon, authenticated;
grant execute on function public.submit_motm_vote(uuid, uuid, uuid) to anon, authenticated;
grant execute on function public.my_motm_votes(uuid) to anon, authenticated;
