import { Swords, Goal, Handshake, CalendarDays } from "lucide-react";
import { getHeadToHead, getTeams, getMatches, getTeamStats } from "@/lib/queries";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";
import { MatchCard } from "@/components/ui/match-card";
import { VersusBoard } from "@/components/home/versus-board";
import { StatTile } from "@/components/home/stat-tile";
import { Reveal } from "@/components/home/reveal";
import { CountUp } from "@/components/home/count-up";

export const metadata = { title: "Confrontations — Tally Carreaux" };

export default async function ConfrontationsPage() {
  const [h2h, teams, matches, teamStats] = await Promise.all([
    getHeadToHead(),
    getTeams(),
    getMatches(),
    getTeamStats(),
  ]);
  const [teamA, teamB] = teams;
  const statsA = teamStats.find((s) => s.team_id === teamA?.id);
  const statsB = teamStats.find((s) => s.team_id === teamB?.id);
  const finished = matches.filter((m) => m.status === "termine");

  const total = h2h?.total_matches ?? 0;
  const avgGoals = total > 0 ? ((h2h?.total_home_goals ?? 0) + (h2h?.total_away_goals ?? 0)) / total : 0;

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader
        icon={Swords}
        title="Confrontations"
        subtitle="Le face-à-face complet entre les deux équipes : bilan, buts et derniers résultats."
      >
        <HeaderChip label="Rencontres" value={total} />
        <HeaderChip label="Nuls" value={h2h?.draws ?? 0} gold />
      </PageHeader>

      {teamA && teamB && (
        <Reveal>
          <VersusBoard
            teamA={teamA}
            teamB={teamB}
            statsA={statsA}
            statsB={statsB}
            draws={h2h?.draws ?? 0}
          />
        </Reveal>
      )}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Reveal delay={0} className="h-full">
          <StatTile label="Confrontations totales" value={total} icon={Swords} tone="navy" />
        </Reveal>
        <Reveal delay={90} className="h-full">
          <StatTile label="Matchs nuls" value={h2h?.draws ?? 0} icon={Handshake} tone="gold" />
        </Reveal>
        <Reveal delay={180} className="h-full">
          <StatTile
            label={`Buts ${teamA?.name ?? ""}`}
            value={h2h?.total_home_goals ?? 0}
            icon={Goal}
            tone="red"
          />
        </Reveal>
        <Reveal delay={270} className="h-full">
          <StatTile
            label={`Buts ${teamB?.name ?? ""}`}
            value={h2h?.total_away_goals ?? 0}
            icon={Goal}
            tone="blue"
          />
        </Reveal>
      </section>

      <Reveal>
        <div className="card flex items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-sm text-muted-foreground">Moyenne de buts par rencontre</p>
            <p className="score-numeral mt-1 text-5xl sm:text-6xl">
              <CountUp value={avgGoals} decimals={1} />
            </p>
          </div>
          <CalendarDays size={56} strokeWidth={1.2} className="text-yellow-500/70" />
        </div>
      </Reveal>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Derniers résultats</h2>
        {finished.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun résultat pour le moment.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finished.slice(0, 6).map((m, i) => {
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
        )}
      </section>
    </div>
  );
}

export const revalidate = 0;
