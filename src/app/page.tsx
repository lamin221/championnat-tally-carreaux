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

  const totalMatches = statsA?.matches_played ?? 0;
  const totalDraws = statsA?.draws ?? 0;
  const totalGoals = (statsA?.goals_scored ?? 0) + (statsB?.goals_scored ?? 0);

  const findTeam = (id?: string | null) => teams.find((t) => t.id === id);

  return (
    <div className="flex flex-col gap-10">
      {/* Hero façon tableau d'affichage de stade : les deux couleurs d'équipe
          se rencontrent sur une diagonale, comme sur un panneau de score. */}
      <section
        className="scoreboard-split rounded-3xl px-6 py-10 sm:py-14 text-white text-center"
        style={
          {
            "--team-a-color": teamA?.primary_color ?? "#DC2626",
            "--team-b-color": teamB?.primary_color ?? "#1E40AF",
          } as React.CSSProperties
        }
      >
        <p className="uppercase tracking-[0.2em] text-xs sm:text-sm text-white/70 font-medium">
          Terrain Diéxal
        </p>
        <h1 className="font-display font-bold text-3xl sm:text-5xl mt-3 leading-tight">
          {teamA?.name ?? "Équipe A"}
          <span className="mx-3 text-white/60 font-normal">vs</span>
          {teamB?.name ?? "Équipe B"}
        </h1>
        <p className="text-white/80 mt-3 text-sm sm:text-base">
          Historique complet, statistiques et classements en temps réel
        </p>
        <div className="flex items-center justify-center gap-8 sm:gap-14 mt-8">
          <div>
            <p className="score-numeral text-4xl sm:text-6xl">{statsA?.wins ?? 0}</p>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/70 mt-1">Victoires</p>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div>
            <p className="score-numeral text-4xl sm:text-6xl">{totalDraws}</p>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/70 mt-1">Nuls</p>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div>
            <p className="score-numeral text-4xl sm:text-6xl">{statsB?.wins ?? 0}</p>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/70 mt-1">Victoires</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Matchs joués" value={totalMatches} icon={Calendar} />
        <StatCard label="Buts marqués (total)" value={totalGoals} icon={GoalIcon} />
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
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display font-semibold text-lg mb-3">Dernier match</h2>
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
          <h2 className="font-display font-semibold text-lg mb-3">Prochain match</h2>
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
