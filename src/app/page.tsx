import Link from "next/link";
import { Goal as GoalIcon, Calendar, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { TeamBadge } from "@/components/ui/team-badge";
import {
  getTeams,
  getTeamStats,
  getLastAndNextMatch,
  getTeamRecentForm,
  getHeadToHead,
} from "@/lib/queries";

function FormDot({ result }: { result: "W" | "L" | "D" }) {
  const color = result === "W" ? "bg-emerald-500" : result === "L" ? "bg-red-500" : "bg-amber-400";
  return <span className={`w-3.5 h-3.5 rounded-full ${color}`} />;
}

export default async function DashboardPage() {
  const [teams, teamStats, { lastMatch, nextMatch }, h2h] = await Promise.all([
    getTeams(),
    getTeamStats(),
    getLastAndNextMatch(),
    getHeadToHead(),
  ]);

  const [teamA, teamB] = teams;
  const statsA = teamStats.find((s) => s.team_id === teamA?.id);
  const statsB = teamStats.find((s) => s.team_id === teamB?.id);

  const [formA, formB] = await Promise.all([
    teamA ? getTeamRecentForm(teamA.id) : Promise.resolve([]),
    teamB ? getTeamRecentForm(teamB.id) : Promise.resolve([]),
  ]);

  const totalMatches = h2h?.total_matches ?? 0;
  const totalDraws = h2h?.draws ?? 0;
  const totalGoals = (h2h?.total_home_goals ?? 0) + (h2h?.total_away_goals ?? 0);

  const findTeam = (id?: string | null) => teams.find((t) => t.id === id);
  const lastHome = lastMatch ? findTeam(lastMatch.home_team_id) : null;
  const lastAway = lastMatch ? findTeam(lastMatch.away_team_id) : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Carte de confrontation compacte */}
      <section className="card p-6 sm:p-8 animate-fade-in">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Terrain Diéxal
        </p>

        <div className="flex items-center justify-between gap-3 mt-5">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={teamA ?? { name: "Équipe A", logo_url: null, primary_color: "#DC2626" }} size={48} showName={false} />
            <span className="text-sm font-semibold text-center">{teamA?.name ?? "Équipe A"}</span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="score-numeral text-3xl sm:text-4xl">
              {h2h?.total_home_goals ?? 0} - {h2h?.total_away_goals ?? 0}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Cumul buts</span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={teamB ?? { name: "Équipe B", logo_url: null, primary_color: "#1E40AF" }} size={48} showName={false} />
            <span className="text-sm font-semibold text-center">{teamB?.name ?? "Équipe B"}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-border text-sm">
          <div className="text-center">
            <p className="score-numeral text-lg">{statsA?.wins ?? 0}</p>
            <p className="text-[11px] text-muted-foreground">Victoires</p>
          </div>
          <div className="text-center">
            <p className="score-numeral text-lg">{totalDraws}</p>
            <p className="text-[11px] text-muted-foreground">Nuls</p>
          </div>
          <div className="text-center">
            <p className="score-numeral text-lg">{statsB?.wins ?? 0}</p>
            <p className="text-[11px] text-muted-foreground">Victoires</p>
          </div>
        </div>
      </section>

      {/* Dashboard de stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Matchs joués" value={totalMatches} icon={Calendar} />
        <StatCard label="Buts marqués" value={totalGoals} icon={GoalIcon} />
        <StatCard label={`Victoires ${teamA?.name ?? "Équipe A"}`} value={statsA?.wins ?? 0} icon={GoalIcon} accent="tally" />
        <StatCard label={`Victoires ${teamB?.name ?? "Équipe B"}`} value={statsB?.wins ?? 0} icon={GoalIcon} accent="carreaux" />
      </section>

      {/* Forme récente */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display font-semibold text-base mb-4">Forme récente</h2>
        <div className="flex flex-col gap-4">
          {[{ team: teamA, form: formA }, { team: teamB, form: formB }].map(({ team, form }) =>
            team ? (
              <div key={team.id} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">{team.name}</span>
                <div className="flex items-center gap-1.5">
                  {form.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Pas encore de match</span>
                  ) : (
                    [...form].reverse().map((f) => <FormDot key={f.match_id} result={f.result as "W" | "L" | "D"} />)
                  )}
                </div>
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* Dernier match */}
      {lastMatch && lastHome && lastAway && (
        <section className="card p-5 sm:p-6">
          <h2 className="font-display font-semibold text-base mb-4">Dernier match</h2>
          <div className="flex items-center justify-between gap-3">
            <TeamBadge team={lastHome} />
            <span className="score-numeral text-2xl shrink-0 px-2">
              {lastMatch.home_score} - {lastMatch.away_score}
            </span>
            <TeamBadge team={lastAway} />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {lastMatch.venue} · {lastMatch.match_date}
          </p>
          <Link
            href={`/matchs/${lastMatch.id}`}
            className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-tally hover:underline"
          >
            Voir les détails <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {nextMatch && findTeam(nextMatch.home_team_id) && findTeam(nextMatch.away_team_id) && (
        <section className="card p-5 sm:p-6 border-tally/30">
          <h2 className="font-display font-semibold text-base mb-4">Prochain match</h2>
          <div className="flex items-center justify-between gap-3">
            <TeamBadge team={findTeam(nextMatch.home_team_id)!} />
            <span className="text-xs font-medium text-muted-foreground px-3 py-1 rounded-full bg-muted shrink-0">
              À venir
            </span>
            <TeamBadge team={findTeam(nextMatch.away_team_id)!} />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {nextMatch.venue} · {nextMatch.match_date} · {nextMatch.match_time?.slice(0, 5)}
          </p>
        </section>
      )}
    </div>
  );
}

export const revalidate = 0;
