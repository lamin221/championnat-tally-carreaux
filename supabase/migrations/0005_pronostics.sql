-- ============================================================================
-- Pronostics : les visiteurs devinent le résultat des matchs à venir.
-- À exécuter dans Supabase > SQL Editor.
--
-- Pas de compte nécessaire : chaque visiteur choisit un pseudo, et son navigateur
-- garde un identifiant secret. Les tables sont fermées au public : tout passe par
-- les fonctions ci-dessous, qui vérifient les règles (match à venir, coup d'envoi
-- non passé...). Le public ne voit que des totaux et le classement par pseudo.
--
-- Barème : bon résultat (victoire / nul / défaite) = 3 points,
--          score exact = 5 points au total (3 + 2 de bonus).
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.predictors (
  id uuid primary key default uuid_generate_v4(),
  pseudo text not null check (char_length(pseudo) between 2 and 20),
  created_at timestamptz not null default now()
);
-- Un pseudo = une seule personne (sans tenir compte des majuscules)
create unique index if not exists predictors_pseudo_unique on public.predictors (lower(pseudo));

create table if not exists public.predictions (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  predictor_id uuid not null references public.predictors(id) on delete cascade,
  pick text not null check (pick in ('home', 'draw', 'away')),
  home_goals int check (home_goals between 0 and 30),
  away_goals int check (away_goals between 0 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, predictor_id)
);
create index if not exists predictions_match_idx on public.predictions (match_id);

-- Tables fermées : seul l'administrateur y accède directement.
alter table public.predictors enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "predictors_admin_all" on public.predictors;
create policy "predictors_admin_all" on public.predictors
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "predictions_admin_all" on public.predictions;
create policy "predictions_admin_all" on public.predictions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Fonctions (appelées par le site)
-- ---------------------------------------------------------------------------

-- Crée un pronostiqueur et renvoie son identifiant secret.
create or replace function public.create_predictor(p_pseudo text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pseudo text := btrim(coalesce(p_pseudo, ''));
  v_id uuid;
begin
  if char_length(v_pseudo) < 2 or char_length(v_pseudo) > 20
     or v_pseudo !~ '^[A-Za-z0-9À-ÿ _.-]+$' then
    raise exception 'pseudo_invalide';
  end if;

  begin
    insert into predictors (pseudo) values (v_pseudo) returning id into v_id;
  exception when unique_violation then
    raise exception 'pseudo_pris';
  end;

  return v_id;
end;
$$;

-- Renvoie le pseudo d'un identifiant (ou null s'il n'existe plus).
create or replace function public.predictor_pseudo(p_predictor uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select pseudo from predictors where id = p_predictor;
$$;

-- Enregistre (ou modifie) un pronostic, tant que le match n'a pas commencé.
create or replace function public.submit_prediction(
  p_predictor uuid,
  p_match uuid,
  p_pick text,
  p_home int default null,
  p_away int default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match matches%rowtype;
begin
  if not exists (select 1 from predictors where id = p_predictor) then
    raise exception 'predicteur_inconnu';
  end if;

  select * into v_match from matches where id = p_match;
  if not found then
    raise exception 'match_inconnu';
  end if;

  -- Fermé dès que le match est lancé, terminé, annulé, ou que l'heure de début est passée (UTC+0)
  if v_match.status <> 'a_venir'
     or (v_match.match_date + coalesce(v_match.match_time, time '23:59')) <= (now() at time zone 'utc') then
    raise exception 'match_ferme';
  end if;

  if p_pick is null or p_pick not in ('home', 'draw', 'away') then
    raise exception 'pronostic_invalide';
  end if;
  if (p_home is null) <> (p_away is null) then
    raise exception 'pronostic_invalide';
  end if;
  if p_home is not null then
    if p_home < 0 or p_home > 30 or p_away < 0 or p_away > 30 then
      raise exception 'pronostic_invalide';
    end if;
    if (case when p_home > p_away then 'home' when p_home < p_away then 'away' else 'draw' end) <> p_pick then
      raise exception 'pronostic_incoherent';
    end if;
  end if;

  insert into predictions (match_id, predictor_id, pick, home_goals, away_goals)
  values (p_match, p_predictor, p_pick, p_home, p_away)
  on conflict (match_id, predictor_id) do update
    set pick = excluded.pick,
        home_goals = excluded.home_goals,
        away_goals = excluded.away_goals,
        updated_at = now();
end;
$$;

-- Les pronostics d'un visiteur (identifiant secret requis).
create or replace function public.my_predictions(p_predictor uuid)
returns table (match_id uuid, pick text, home_goals int, away_goals int)
language sql
security definer
set search_path = public
stable
as $$
  select match_id, pick, home_goals, away_goals from predictions where predictor_id = p_predictor;
$$;

-- ---------------------------------------------------------------------------
-- Vues publiques (agrégats uniquement, aucun identifiant exposé)
-- ---------------------------------------------------------------------------

-- Répartition des pronostics par match
create or replace view public.prediction_stats as
select
  match_id,
  count(*)::int as total,
  (count(*) filter (where pick = 'home'))::int as home_count,
  (count(*) filter (where pick = 'draw'))::int as draw_count,
  (count(*) filter (where pick = 'away'))::int as away_count
from public.predictions
group by match_id;

-- Classement des pronostiqueurs (matchs terminés uniquement)
create or replace view public.prediction_leaderboard as
with resultats as (
  select
    p.predictor_id,
    p.pick,
    p.home_goals,
    p.away_goals,
    m.home_score,
    m.away_score,
    case
      when m.home_score > m.away_score then 'home'
      when m.home_score < m.away_score then 'away'
      else 'draw'
    end as issue
  from public.predictions p
  join public.matches m on m.id = p.match_id
  where m.status = 'termine' and m.home_score is not null and m.away_score is not null
)
select
  pr.pseudo,
  count(*)::int as played,
  (count(*) filter (where r.pick = r.issue))::int as correct,
  (count(*) filter (where r.home_goals = r.home_score and r.away_goals = r.away_score))::int as exact,
  (
    count(*) filter (where r.pick = r.issue) * 3
    + count(*) filter (where r.home_goals = r.home_score and r.away_goals = r.away_score) * 2
  )::int as points
from resultats r
join public.predictors pr on pr.id = r.predictor_id
group by pr.id, pr.pseudo;

grant select on public.prediction_stats to anon, authenticated;
grant select on public.prediction_leaderboard to anon, authenticated;
grant execute on function public.create_predictor(text) to anon, authenticated;
grant execute on function public.predictor_pseudo(uuid) to anon, authenticated;
grant execute on function public.submit_prediction(uuid, uuid, text, int, int) to anon, authenticated;
grant execute on function public.my_predictions(uuid) to anon, authenticated;
