// ============================================================================
// Types correspondant au schéma Supabase (voir supabase/migrations/0001_init.sql)
// ============================================================================

export type PlayerPosition = "Gardien" | "Défenseur" | "Milieu" | "Attaquant";
export type SanctionType = "suspension_2min" | "exclusion_definitive";
export type MatchStatus = "a_venir" | "en_cours" | "termine" | "annule";
export type MediaType = "photo" | "video";
export type UserRole = "admin" | "visiteur";

export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  founded_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  full_name: string;
  nickname: string | null;
  photo_url: string | null;
  jersey_number: number;
  position: PlayerPosition;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  match_date: string;
  match_time: string;
  venue: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: MatchStatus;
  man_of_the_match_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchLineup {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  is_starter: boolean;
}

export interface Goal {
  id: string;
  match_id: string;
  scorer_id: string;
  assist_id: string | null;
  team_id: string;
  minute: number | null;
  is_own_goal: boolean;
}

export interface Sanction {
  id: string;
  match_id: string;
  player_id: string;
  type: SanctionType;
  minute: number | null;
  reason: string | null;
}

export interface GalleryItem {
  id: string;
  match_id: string | null;
  type: MediaType;
  storage_path: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  cover_url: string | null;
  match_id: string | null;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

// ---- Vues statistiques ----

export interface PlayerStats {
  player_id: string;
  full_name: string;
  nickname: string | null;
  team_id: string;
  jersey_number: number;
  position: PlayerPosition;
  matches_played: number;
  goals: number;
  assists: number;
  goal_contributions: number;
  man_of_the_match_count: number;
  suspensions_2min: number;
  exclusions_definitives: number;
}

export interface TeamStats {
  team_id: string;
  name: string;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  goals_scored: number;
  goals_conceded: number;
  goal_difference: number;
  win_percentage: number;
}

export interface HeadToHead {
  total_matches: number;
  home_wins_as_home: number;
  away_wins_as_away: number;
  draws: number;
  total_home_goals: number;
  total_away_goals: number;
}
