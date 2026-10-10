import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, CalendarDays, Goal, Handshake, ShieldAlert, Trophy, Users } from "lucide-react";
import {
  getTeams,
  getTeamStats,
  getPlayers,
  getPlayerStats,
  getMatches,
  getTeamRecentForm,
} from "@/lib/queries";
import { TeamBadge } from "@/components/ui/team-badge";
import { PlayerCard } from "@/components/ui/player-card";
import { MatchCard } from "@/components/ui/match-card";
import { RankingCard } from "@/components/ui/ranking-card";
import { StatTile } from "@/components/home/stat-tile";
import { FormGuide } from "@/components/home/form-guide";
import { Reveal } from "@/components/home/reveal";
import { CountUp } from "@/components/home/count-up";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = (await getTeams()).find((t) => t.id === id);
  return {
    title: team ? `${team.name} — Tally Carreaux` : "Équipe — Tally Carreaux",
    description: team ? `Bilan, effectif et résultats de ${team.name}.` : undefined,
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [teams, teamStats, players, playerStats, matches, form] = await Promise.all([
    getTeams(),
    getTeamStats(),
    getPlayers(id),
    getPlayerStats(),
    getMatches(),
    getTeamRecentForm(id),
  ]);

  const team = teams.find((t) => t.id === id);
  if (!team) notFound();

  const stats = teamStats.find((s) => s.team_id === id);
  const v = Number(stats?.wins ?? 0);
  const n = Number(stats?.draws ?? 0);
  const d = Number(stats?.losses ?? 0);
  const total = v + n + d;
  const pct = Math.round(Number(stats?.win_percentage ?? 0));

  // Rang : 3 pts la victoire, 1 pt le nul (même barème que la page Classements)
  const points = (tid: string) => {
    const s = teamStats.find((x) => x.team_id === tid);
    return Number(s?.wins ?? 0) * 3 + Number(s?.draws ?? 0);
  };
  const rang = [...teams].sort((a, b) => points(b.id) - points(a.id)).findIndex((t) => t.id === id) + 1;

  const couleur = team.primary_color || "#1E40AF";
  const clair = `color-mix(in srgb, ${couleur} 55%, white)`;

  const joueursEquipe = playerStats.filter((p) => p.team_id === id);
  const nom = (p: (typeof joueursEquipe)[number]) => p.nickname || p.full_name;
  const buteurs = [...joueursEquipe].sort((a, b) => b.goals - a.goals).map((p) => ({ name: nom(p), value: p.goals }));
  const passeurs = [...joueursEquipe].sort((a, b) => b.assists - a.assists).map((p) => ({ name: nom(p), value: p.assists }));

  const matchsEquipe = matches.filter((m) => m.home_team_id === id || m.away_team_id === id);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <Link
        href="/equipes"
        className="group inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
        Toutes les équipes
      </Link>

      {/* Hero */}
      <section className="hero-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-2xl shadow-blue-950/40 sm:p-10">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${clair}, transparent)` }} />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 animate-orb rounded-full blur-3xl"
          style={{ background: `color-mix(in srgb, ${couleur} 55%, transparent)` }}
        />
        <div aria-hidden className="bg-carreaux-grid pointer-events-none absolute inset-0" />

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="animate-float">
            <div className="rounded-full bg-white/10 p-2 shadow-2xl ring-4" style={{ ["--tw-ring-color" as string]: clair }}>
              <TeamBadge team={team} size={120} showName={false} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {total > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1 text-xs font-bold text-amber-950">
                  <Trophy size={13} /> {rang === 1 ? "1er" : `${rang}e`} du classement
                </span>
              )}
              {team.founded_date && (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Depuis {format(parseISO(team.founded_date), "yyyy", { locale: fr })}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">{team.name}</h1>
            <p className="mt-3 text-sm text-white/60">
              {players.length} joueur{players.length > 1 ? "s" : ""} dans l&apos;effectif
            </p>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Matchs joués", value: Number(stats?.matches_played ?? 0), icon: CalendarDays, tone: "navy" as const },
          { label: "Victoires", value: v, icon: Trophy, tone: "gold" as const },
          { label: "Buts marqués", value: Number(stats?.goals_scored ?? 0), icon: Goal, tone: "blue" as const },
          { label: "Buts encaissés", value: Number(stats?.goals_conceded ?? 0), icon: ShieldAlert, tone: "red" as const },
        ].map((t, i) => (
          <Reveal key={t.label} delay={i * 90} className="h-full">
            <StatTile {...t} />
          </Reveal>
        ))}
      </section>

      {/* Bilan */}
      <Reveal>
        <section className="card p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-lg font-semibold">Bilan</h2>
            <p className="text-sm text-muted-foreground">
              <span className="score-numeral text-3xl text-foreground"><CountUp value={pct} suffix="%" /></span>{" "}
              de victoires
            </p>
          </div>
          <div className="bar-grow mt-4 flex h-4 origin-left overflow-hidden rounded-full bg-muted">
            {total > 0 && (
              <>
                <div className="bg-emerald-500" style={{ flexGrow: v }} />
                <div className="bg-amber-400" style={{ flexGrow: n }} />
                <div className="bg-red-500" style={{ flexGrow: d }} />
              </>
            )}
          </div>
          <div className="mt-3 flex justify-between text-xs font-medium">
            <span className="text-emerald-600">{v} victoire{v > 1 ? "s" : ""}</span>
            <span className="text-amber-600">{n} nul{n > 1 ? "s" : ""}</span>
            <span className="text-red-600">{d} défaite{d > 1 ? "s" : ""}</span>
          </div>
        </section>
      </Reveal>

      {/* Forme */}
      <Reveal>
        <FormGuide rows={[{ team, form }]} />
      </Reveal>

      {/* Meilleurs joueurs */}
      <section className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <RankingCard title="Meilleurs buteurs" icon={Goal} players={buteurs} metric="buts" />
        </Reveal>
        <Reveal delay={120} className="h-full">
          <RankingCard title="Meilleurs passeurs" icon={Handshake} players={passeurs} metric="passes" />
        </Reveal>
      </section>

      {/* Matchs */}
      {matchsEquipe.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
            <CalendarDays size={20} className="text-yellow-500" /> Matchs de l&apos;équipe
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchsEquipe.slice(0, 6).map((m, i) => {
              const home = teams.find((t) => t.id === m.home_team_id);
              const away = teams.find((t) => t.id === m.away_team_id);
              if (!home || !away) return null;
              return (
                <Reveal key={m.id} delay={(i % 3) * 100} className="h-full">
                  <MatchCard match={m} homeTeam={home} awayTeam={away} />
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Effectif */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
          <Users size={20} className="text-yellow-500" /> Effectif
        </h2>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun joueur enregistré pour cette équipe.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player, i) => {
              const s = playerStats.find((st) => st.player_id === player.id);
              return (
                <Reveal key={player.id} delay={(i % 3) * 90} className="h-full">
                  <PlayerCard
                    player={player}
                    team={team}
                    goals={s?.goals ?? 0}
                    assists={s?.assists ?? 0}
                    matches={s?.matches_played ?? 0}
                  />
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export const revalidate = 0;
