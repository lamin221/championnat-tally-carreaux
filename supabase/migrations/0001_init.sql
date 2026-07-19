-- ============================================================================
-- CHAMPIONNAT TALLY CARREAUX — Schéma initial
-- ============================================================================
-- Ce script crée :
--   1. Les tables principales (équipes, joueurs, matchs, événements, etc.)
--   2. Les vues de statistiques calculées automatiquement
--   3. Les policies RLS (Row Level Security)
--   4. Les triggers utilitaires (updated_at, notifications realtime)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type player_position as enum (
  'Gardien', 'Défenseur', 'Milieu', 'Attaquant'
);

create type sanction_type as enum (
  'suspension_2min', 'exclusion_definitive'
);

create type match_status as enum (
  'a_venir', 'en_cours', 'termine', 'annule'
);

create type media_type as enum ('photo', 'video');

create type user_role as enum ('admin', 'visiteur');

-- ----------------------------------------------------------------------------
-- PROFILES (extension de auth.users pour gérer les rôles)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role user_role not null default 'visiteur',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ÉQUIPES (exactement 2)
-- ----------------------------------------------------------------------------
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  logo_url text,
  primary_color text not null default '#1E40AF',
  secondary_color text default '#FFFFFF',
  founded_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- JOUEURS
-- ----------------------------------------------------------------------------
create table public.players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  full_name text not null,
  nickname text,
  photo_url text,
  jersey_number int not null,
  position player_position not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, jersey_number)
);

-- ----------------------------------------------------------------------------
-- MATCHS
-- ----------------------------------------------------------------------------
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  match_date date not null,
  match_time time not null,
  venue text not null default 'Terrain Diéxal',
  home_team_id uuid not null references public.teams(id),
  away_team_id uuid not null references public.teams(id),
  home_score int default 0,
  away_score int default 0,
  status match_status not null default 'a_venir',
  man_of_the_match_id uuid references public.players(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);

-- Composition (lineup) d'un match
create table public.match_lineups (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id),
  is_starter boolean not null default true,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

-- Buts
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  scorer_id uuid not null references public.players(id),
  assist_id uuid references public.players(id),
  team_id uuid not null references public.teams(id),
  minute int,
  is_own_goal boolean not null default false,
  created_at timestamptz not null default now()
);

-- Sanctions
create table public.sanctions (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id),
  type sanction_type not null,
  minute int,
  reason text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- GALERIE (photos / vidéos stockées dans Supabase Storage)
-- ----------------------------------------------------------------------------
create table public.gallery_items (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete set null,
  type media_type not null,
  storage_path text not null,
  caption text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ACTUALITÉS
-- ----------------------------------------------------------------------------
create table public.news (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  cover_url text,
  match_id uuid references public.matches(id) on delete set null,
  published boolean not null default true,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------
create index idx_players_team on public.players(team_id);
create index idx_matches_date on public.matches(match_date desc);
create index idx_goals_match on public.goals(match_id);
create index idx_goals_scorer on public.goals(scorer_id);
create index idx_goals_assist on public.goals(assist_id);
create index idx_sanctions_player on public.sanctions(player_id);
create index idx_lineups_match on public.match_lineups(match_id);
create index idx_gallery_match on public.gallery_items(match_id);

-- ----------------------------------------------------------------------------
-- TRIGGER : updated_at automatique
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_teams_updated before update on public.teams
  for each row execute function public.set_updated_at();
create trigger trg_players_updated before update on public.players
  for each row execute function public.set_updated_at();
create trigger trg_matches_updated before update on public.matches
  for each row execute function public.set_updated_at();
create trigger trg_news_updated before update on public.news
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- TRIGGER : nouveau user -> profile "visiteur" par défaut
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'visiteur');
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- VUES DE STATISTIQUES (calcul automatique, temps réel)
-- ============================================================================

-- Stats par joueur
create or replace view public.player_stats as
select
  p.id as player_id,
  p.full_name,
  p.nickname,
  p.team_id,
  p.jersey_number,
  p.position,
  count(distinct ml.match_id) filter (where ml.player_id = p.id) as matches_played,
  coalesce(g.goals_count, 0) as goals,
  coalesce(a.assists_count, 0) as assists,
  coalesce(g.goals_count, 0) + coalesce(a.assists_count, 0) as goal_contributions,
  coalesce(motm.motm_count, 0) as man_of_the_match_count,
  coalesce(s2.suspensions_count, 0) as suspensions_2min,
  coalesce(sx.exclusions_count, 0) as exclusions_definitives
from public.players p
left join public.match_lineups ml on ml.player_id = p.id
left join (
  select scorer_id, count(*) as goals_count
  from public.goals where not is_own_goal group by scorer_id
) g on g.scorer_id = p.id
left join (
  select assist_id, count(*) as assists_count
  from public.goals where assist_id is not null group by assist_id
) a on a.assist_id = p.id
left join (
  select man_of_the_match_id, count(*) as motm_count
  from public.matches where man_of_the_match_id is not null
  group by man_of_the_match_id
) motm on motm.man_of_the_match_id = p.id
left join (
  select player_id, count(*) as suspensions_count
  from public.sanctions where type = 'suspension_2min' group by player_id
) s2 on s2.player_id = p.id
left join (
  select player_id, count(*) as exclusions_count
  from public.sanctions where type = 'exclusion_definitive' group by player_id
) sx on sx.player_id = p.id
group by p.id, g.goals_count, a.assists_count, motm.motm_count,
         s2.suspensions_count, sx.exclusions_count;

-- Stats par équipe
create or replace view public.team_stats as
with played as (
  select * from public.matches where status = 'termine'
),
per_team as (
  select home_team_id as team_id, home_score as scored, away_score as conceded,
    case when home_score > away_score then 'W'
         when home_score < away_score then 'L'
         else 'D' end as result,
    match_date, id as match_id
  from played
  union all
  select away_team_id as team_id, away_score as scored, home_score as conceded,
    case when away_score > home_score then 'W'
         when away_score < home_score then 'L'
         else 'D' end as result,
    match_date, id as match_id
  from played
)
select
  t.id as team_id,
  t.name,
  count(pt.match_id) as matches_played,
  count(*) filter (where pt.result = 'W') as wins,
  count(*) filter (where pt.result = 'L') as losses,
  count(*) filter (where pt.result = 'D') as draws,
  coalesce(sum(pt.scored), 0) as goals_scored,
  coalesce(sum(pt.conceded), 0) as goals_conceded,
  coalesce(sum(pt.scored), 0) - coalesce(sum(pt.conceded), 0) as goal_difference,
  case when count(pt.match_id) > 0
    then round(100.0 * count(*) filter (where pt.result = 'W') / count(pt.match_id), 1)
    else 0 end as win_percentage
from public.teams t
left join per_team pt on pt.team_id = t.id
group by t.id, t.name;

-- Forme récente (5 derniers matchs) par équipe, avec résultat ordonné
create or replace view public.team_recent_form as
with played as (
  select * from public.matches where status = 'termine'
),
per_team as (
  select home_team_id as team_id, match_date, match_time, id as match_id,
    case when home_score > away_score then 'W'
         when home_score < away_score then 'L' else 'D' end as result
  from played
  union all
  select away_team_id as team_id, match_date, match_time, id as match_id,
    case when away_score > home_score then 'W'
         when away_score < home_score then 'L' else 'D' end as result
  from played
),
ranked as (
  select *, row_number() over (
    partition by team_id order by match_date desc, match_time desc
  ) as rn
  from per_team
)
select team_id, match_id, match_date, result, rn
from ranked
where rn <= 5
order by team_id, rn;

-- Confrontations directes (les 2 équipes uniquement, agrégat global)
create or replace view public.head_to_head as
select
  count(*) as total_matches,
  count(*) filter (where home_score > away_score) as home_wins_as_home,
  count(*) filter (where away_score > home_score) as away_wins_as_away,
  count(*) filter (where home_score = away_score) as draws,
  sum(home_score) as total_home_goals,
  sum(away_score) as total_away_goals
from public.matches
where status = 'termine';

-- Records
create or replace view public.record_biggest_win as
select id as match_id, match_date, home_team_id, away_team_id, home_score, away_score,
  abs(home_score - away_score) as margin
from public.matches
where status = 'termine'
order by margin desc
limit 1;

create or replace view public.record_most_goals_match as
select id as match_id, match_date, home_team_id, away_team_id, home_score, away_score,
  (home_score + away_score) as total_goals
from public.matches
where status = 'termine'
order by total_goals desc
limit 1;

create or replace view public.record_player_goals_in_match as
select scorer_id as player_id, match_id, count(*) as goals_in_match
from public.goals
where not is_own_goal
group by scorer_id, match_id
order by goals_in_match desc
limit 1;

create or replace view public.record_player_assists_in_match as
select assist_id as player_id, match_id, count(*) as assists_in_match
from public.goals
where assist_id is not null
group by assist_id, match_id
order by assists_in_match desc
limit 1;

create or replace view public.record_most_sanctions_match as
select match_id, count(*) as sanctions_count
from public.sanctions
group by match_id
order by sanctions_count desc
limit 1;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_lineups enable row level security;
alter table public.goals enable row level security;
alter table public.sanctions enable row level security;
alter table public.gallery_items enable row level security;
alter table public.news enable row level security;

-- Fonction utilitaire : l'utilisateur courant est-il admin ?
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES : chacun voit son propre profil, l'admin voit tout
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- LECTURE PUBLIQUE (visiteur + admin) sur toutes les données sportives
create policy "teams_public_read" on public.teams for select using (true);
create policy "players_public_read" on public.players for select using (true);
create policy "matches_public_read" on public.matches for select using (true);
create policy "lineups_public_read" on public.match_lineups for select using (true);
create policy "goals_public_read" on public.goals for select using (true);
create policy "sanctions_public_read" on public.sanctions for select using (true);
create policy "gallery_public_read" on public.gallery_items for select using (true);
create policy "news_public_read" on public.news for select using (published = true or public.is_admin());

-- ÉCRITURE : réservée à l'admin uniquement
create policy "teams_admin_write" on public.teams
  for all using (public.is_admin()) with check (public.is_admin());
create policy "players_admin_write" on public.players
  for all using (public.is_admin()) with check (public.is_admin());
create policy "matches_admin_write" on public.matches
  for all using (public.is_admin()) with check (public.is_admin());
create policy "lineups_admin_write" on public.match_lineups
  for all using (public.is_admin()) with check (public.is_admin());
create policy "goals_admin_write" on public.goals
  for all using (public.is_admin()) with check (public.is_admin());
create policy "sanctions_admin_write" on public.sanctions
  for all using (public.is_admin()) with check (public.is_admin());
create policy "gallery_admin_write" on public.gallery_items
  for all using (public.is_admin()) with check (public.is_admin());
create policy "news_admin_write" on public.news
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- REALTIME (pour rafraîchir dashboard/classements automatiquement)
-- ============================================================================
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.sanctions;
alter publication supabase_realtime add table public.news;

-- ============================================================================
-- DONNÉES INITIALES : les deux équipes du championnat
-- ============================================================================
insert into public.teams (name, primary_color, secondary_color, founded_date)
values
  ('Équipe Tally', '#DC2626', '#FFFFFF', now()),
  ('Équipe Carreaux', '#1E40AF', '#FFD700', now());
