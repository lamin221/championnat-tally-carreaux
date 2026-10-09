import { Trophy, Goal, Handshake, Flame, CalendarDays, ShieldAlert, Star } from "lucide-react";
import { getPlayerStats, getTeams, getTeamStats } from "@/lib/queries";
import { TopPlayersBarChart, GoalsDistributionPie } from "@/components/charts/charts";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";
import { RankingCard } from "@/components/ui/ranking-card";
import { StandingsPanel } from "@/components/ui/standings-panel";
import { Reveal } from "@/components/home/reveal";

export const metadata = { title: "Classements — Tally Carreaux" };

export default async function ClassementsPage() {
  const [stats, teams, teamStats] = await Promise.all([getPlayerStats(), getTeams(), getTeamStats()]);

  // Classement par équipe : 3 pts victoire, 1 pt nul, 0 pt défaite (barème standard)
  const standings = teams
    .map((team) => {
      const s = teamStats.find((ts) => ts.team_id === team.id);
      const points = (s?.wins ?? 0) * 3 + (s?.draws ?? 0);
      return { team, stats: s, points };
    })
    .sort((a, b) => b.points - a.points || (b.stats?.goal_difference ?? 0) - (a.stats?.goal_difference ?? 0));

  const nameOf = (s: (typeof stats)[number]) => s.nickname || s.full_name;

  const byGoals = [...stats].sort((a, b) => b.goals - a.goals).map((s) => ({ name: nameOf(s), value: s.goals }));
  const byAssists = [...stats].sort((a, b) => b.assists - a.assists).map((s) => ({ name: nameOf(s), value: s.assists }));
  const byContrib = [...stats].sort((a, b) => b.goal_contributions - a.goal_contributions).map((s) => ({ name: nameOf(s), value: s.goal_contributions }));
  const byMatches = [...stats].sort((a, b) => b.matches_played - a.matches_played).map((s) => ({ name: nameOf(s), value: s.matches_played }));
  const bySanctions = [...stats]
    .sort((a, b) => (b.suspensions_2min + b.exclusions_definitives) - (a.suspensions_2min + a.exclusions_definitives))
    .map((s) => ({ name: nameOf(s), value: s.suspensions_2min + s.exclusions_definitives }));
  const byMotm = [...stats].sort((a, b) => b.man_of_the_match_count - a.man_of_the_match_count).map((s) => ({ name: nameOf(s), value: s.man_of_the_match_count }));

  const goalsPerTeam = teams.map((t) => ({
    name: t.name,
    value: stats.filter((s) => s.team_id === t.id).reduce((sum, s) => sum + s.goals, 0),
  }));

  const totalButs = stats.reduce((sum, s) => sum + s.goals, 0);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={Trophy}
        title="Classements"
        subtitle="Le classement des équipes et les meilleurs joueurs du championnat, mis à jour après chaque match."
      >
        <HeaderChip label="Joueurs" value={stats.length} />
        <HeaderChip label="Buts" value={totalButs} gold />
      </PageHeader>

      {/* Classement par équipe */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Classement du championnat</h2>
        <Reveal>
          <StandingsPanel standings={standings} />
        </Reveal>
      </section>

      {/* Classements des joueurs */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Classements des joueurs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { title: "Meilleur buteur", icon: Goal, players: byGoals, metric: "buts" },
            { title: "Meilleur passeur", icon: Handshake, players: byAssists, metric: "passes" },
            { title: "Joueur le plus décisif", icon: Flame, players: byContrib, metric: "contrib." },
            { title: "Le plus de matchs joués", icon: CalendarDays, players: byMatches, metric: "matchs" },
            { title: "Le plus de sanctions", icon: ShieldAlert, players: bySanctions, metric: "sanctions" },
            { title: "Hommes du match", icon: Star, players: byMotm, metric: "trophées" },
          ].map((r, i) => (
            <Reveal key={r.title} delay={(i % 2) * 120} className="h-full">
              <RankingCard {...r} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Graphiques */}
      <section className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <div className="card h-full p-5 sm:p-6">
            <h2 className="mb-2 font-display font-semibold">Top buteurs</h2>
            <TopPlayersBarChart data={byGoals.slice(0, 8)} label="Buts" />
          </div>
        </Reveal>
        <Reveal delay={120} className="h-full">
          <div className="card h-full p-5 sm:p-6">
            <h2 className="mb-2 font-display font-semibold">Répartition des buts par équipe</h2>
            <GoalsDistributionPie data={goalsPerTeam} />
          </div>
        </Reveal>
      </section>
    </div>
  );
}

export const revalidate = 0;
