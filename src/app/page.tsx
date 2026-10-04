import { SportHero } from '@/components/home/sport-hero';
import { OctobreRoseBanner } from '@/components/home/octobre-rose-banner';
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

  const colorA = teamA?.primary_color ?? "#DC2626";
  const colorB = teamB?.primary_color ?? "#1E40AF";

  return (
    <div className="flex flex-col gap-8">
      <OctobreRoseBanner />
      {/* Hero façon app sportive premium : dégradé sombre aux couleurs des équipes,
          gros score lumineux, effet "glow" discret derrière les badges. */}
          <SportHero
  imageSrc="/images/hero-match.jpg"
  imageAlt="Joueur du championnat Tally Carreaux en action"
/>
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-8 sm:py-10 text-white animate-fade-in"
        style={{
          background: `linear-gradient(145deg, ${colorA}dd 0%, #0f0b2e 45%, ${colorB}dd 100%)`,
        }}
      >
        {/* halos lumineux décoratifs */}
        <div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: colorA }}
        />
        <div
          className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: colorB }}
        />

        <p className="relative text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
          Terrain Diéxal
        </p>

        <div className="relative flex items-center justify-between gap-2 mt-6">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5">
              <TeamBadge team={teamA ?? { name: "Équipe A", logo_url: null, primary_color: colorA }} size={44} showName={false} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{teamA?.name ?? "Équipe A"}</span>
          </div>

          <div className="flex flex-col items-center px-1">
            <div className="score-numeral text-4xl sm:text-6xl tracking-tight">
              {h2h?.total_home_goals ?? 0}<span className="text-white/40 mx-1">-</span>{h2h?.total_away_goals ?? 0}
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 mt-1">Cumul buts</span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5">
              <TeamBadge team={teamB ?? { name: "Équipe B", logo_url: null, primary_color: colorB }} size={44} showName={false} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{teamB?.name ?? "Équipe B"}</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-6 sm:gap-10 mt-7 pt-5 border-t border-white/15 text-sm">
          <div className="text-center">
            <p className="score-numeral text-xl sm:text-2xl">{statsA?.wins ?? 0}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">Victoires</p>
          </div>
          <div className="text-center">
            <p className="score-numeral text-xl sm:text-2xl">{totalDraws}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">Nuls</p>
          </div>
          <div className="text-center">
            <p className="score-numeral text-xl sm:text-2xl">{statsB?.wins ?? 0}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">Victoires</p>
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
        <section className="card p-5 sm:p-6">
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
