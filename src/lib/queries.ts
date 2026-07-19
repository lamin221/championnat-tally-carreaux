import { createClient } from "@/lib/supabase/server";
import type {
  Team,
  Player,
  Match,
  PlayerStats,
  TeamStats,
  HeadToHead,
  Goal,
  Sanction,
  MatchLineup,
  NewsItem,
  GalleryItem,
} from "@/types/database";

// ------------------------------------------------------------------
// Équipes & joueurs
// ------------------------------------------------------------------
export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").order("name");
  return data ?? [];
}

export async function getPlayers(teamId?: string): Promise<Player[]> {
  const supabase = await createClient();
  let query = supabase.from("players").select("*").order("jersey_number");
  if (teamId) query = query.eq("team_id", teamId);
  const { data } = await query;
  return data ?? [];
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("players").select("*").eq("id", id).single();
  return data;
}

// ------------------------------------------------------------------
// Matchs
// ------------------------------------------------------------------
export async function getMatches(): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: false })
    .order("match_time", { ascending: false });
  return data ?? [];
}

export async function getMatchById(id: string): Promise<Match | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("matches").select("*").eq("id", id).single();
  return data;
}

export async function getMatchDetails(matchId: string) {
  const supabase = await createClient();
  const [lineups, goals, sanctions] = await Promise.all([
    supabase.from("match_lineups").select("*").eq("match_id", matchId),
    supabase.from("goals").select("*").eq("match_id", matchId),
    supabase.from("sanctions").select("*").eq("match_id", matchId),
  ]);
  return {
    lineups: (lineups.data ?? []) as MatchLineup[],
    goals: (goals.data ?? []) as Goal[],
    sanctions: (sanctions.data ?? []) as Sanction[],
  };
}

export async function getLastAndNextMatch() {
  const supabase = await createClient();
  const [last, next] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .eq("status", "termine")
      .order("match_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("matches")
      .select("*")
      .eq("status", "a_venir")
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return { lastMatch: last.data as Match | null, nextMatch: next.data as Match | null };
}

// ------------------------------------------------------------------
// Statistiques (vues SQL calculées automatiquement)
// ------------------------------------------------------------------
export async function getPlayerStats(): Promise<PlayerStats[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("player_stats").select("*");
  return data ?? [];
}

export async function getTeamStats(): Promise<TeamStats[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("team_stats").select("*");
  return data ?? [];
}

export async function getHeadToHead(): Promise<HeadToHead | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("head_to_head").select("*").single();
  return data;
}

export async function getTeamRecentForm(teamId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_recent_form")
    .select("*")
    .eq("team_id", teamId)
    .order("rn");
  return data ?? [];
}

export async function getRecords() {
  const supabase = await createClient();
  const [biggestWin, mostGoals, playerGoals, playerAssists, mostSanctions] =
    await Promise.all([
      supabase.from("record_biggest_win").select("*").maybeSingle(),
      supabase.from("record_most_goals_match").select("*").maybeSingle(),
      supabase.from("record_player_goals_in_match").select("*").maybeSingle(),
      supabase.from("record_player_assists_in_match").select("*").maybeSingle(),
      supabase.from("record_most_sanctions_match").select("*").maybeSingle(),
    ]);
  return {
    biggestWin: biggestWin.data,
    mostGoals: mostGoals.data,
    playerGoals: playerGoals.data,
    playerAssists: playerAssists.data,
    mostSanctions: mostSanctions.data,
  };
}

// ------------------------------------------------------------------
// Galerie & actualités
// ------------------------------------------------------------------
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getNews(): Promise<NewsItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}
