import { Trophy, Goal as GoalIcon, Handshake, Calendar, Swords } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { MatchCard } from "@/components/ui/match-card";
import { getTeams, getTeamStats, getLastAndNextMatch } from "@/lib/queries";

export default async function DashboardPage() {
  const [teams, teamStats, { lastMatch, nextMatch }] = await Promise.all([
    getTeams(),
    getTeamStats(),
    getLastAndNextMatch(),
  ]);

  const [teamA, teamB] = teams;
  const statsA = teamStats.find((s) => s.team_id === teamA?.id);
  const statsB = teamStats.find((s) => s.team_id === teamB?.id);

  const totalMatches = (statsA?.matches_played ?? 0);
  const totalDraws = statsA?.draws ?? 0;
  const totalGoals = (statsA?.goals_scored ?? 0) + (statsB?.goals_scored ?? 0);

  const findTeam = (id?: string | null) => teams.find((t) => t.id === id);

  return (
    <div className="flex flex-col gap-10">
      <section className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Championnat <span className="text-tally">Tally</span>{" "}
          <span className="text-carreaux">Carreaux</span>
        </h1>
        <p className="text-foreground/60 mt-2">
          Terrain Diéxal — Historique complet, statistiques et classements en temps réel
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Matchs joués" value={totalMatches} icon={Calendar} />
        <StatCard
          label={`Victoires ${teamA?.name ?? "Équipe A"}`}
          value={statsA?.wins ?? 0}
          icon={Trophy}
          accent="tally"
        />
        <StatCard
          label={`Victoires ${teamB?.name ?? "Équipe B"}`}
          value={statsB?.wins ?? 0}
          icon={Trophy}
          accent="carreaux"
        />
        <StatCard label="Matchs nuls" value={totalDraws} icon={Handshake} />
        <StatCard label="Buts marqués (total)" value={totalGoals} icon={GoalIcon} />
        <StatCard label="Confrontations" value={totalMatches} icon={Swords} />
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-lg mb-3">Dernier match</h2>
          {lastMatch && findTeam(lastMatch.home_team_id) && findTeam(lastMatch.away_team_id) ? (
            <MatchCard
              match={lastMatch}
              homeTeam={findTeam(lastMatch.home_team_id)!}
              awayTeam={findTeam(lastMatch.away_team_id)!}
            />
          ) : (
            <p className="text-foreground/50 text-sm card p-5">Aucun match joué pour le moment.</p>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-3">Prochain match</h2>
          {nextMatch && findTeam(nextMatch.home_team_id) && findTeam(nextMatch.away_team_id) ? (
            <MatchCard
              match={nextMatch}
              homeTeam={findTeam(nextMatch.home_team_id)!}
              awayTeam={findTeam(nextMatch.away_team_id)!}
            />
          ) : (
            <p className="text-foreground/50 text-sm card p-5">Aucun match programmé.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export const revalidate = 0;
