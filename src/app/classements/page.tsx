import { getPlayerStats, getTeams } from "@/lib/queries";
import { TopPlayersBarChart, GoalsDistributionPie } from "@/components/charts/charts";

export const metadata = { title: "Classements — Tally Carreaux" };

function Ranking({
  title,
  players,
  metric,
}: {
  title: string;
  players: { name: string; value: number }[];
  metric: string;
}) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold mb-3">{title}</h2>
      <ol className="space-y-2 text-sm">
        {players.slice(0, 5).map((p, i) => (
          <li key={p.name} className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {p.name}
            </span>
            <span className="font-semibold">{p.value} {metric}</span>
          </li>
        ))}
        {players.length === 0 && <p className="text-foreground/50">Aucune donnée.</p>}
      </ol>
    </section>
  );
}

export default async function ClassementsPage() {
  const [stats, teams] = await Promise.all([getPlayerStats(), getTeams()]);

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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Classements automatiques</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Ranking title="⚽ Meilleur buteur" players={byGoals} metric="buts" />
        <Ranking title="🎯 Meilleur passeur" players={byAssists} metric="passes" />
        <Ranking title="🔥 Joueur le plus décisif" players={byContrib} metric="contributions" />
        <Ranking title="📅 Le plus de matchs joués" players={byMatches} metric="matchs" />
        <Ranking title="🟨 Le plus de sanctions" players={bySanctions} metric="sanctions" />
        <Ranking title="⭐ Le plus de trophées Homme du match" players={byMotm} metric="trophées" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-2">Top buteurs</h2>
          <TopPlayersBarChart data={byGoals.slice(0, 8)} label="Buts" />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-2">Répartition des buts par équipe</h2>
          <GoalsDistributionPie data={goalsPerTeam} />
        </div>
      </div>
    </div>
  );
}

export const revalidate = 0;
