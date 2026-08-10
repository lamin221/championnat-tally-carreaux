import Image from "next/image";
import { getPlayerStats, getTeams, getTeamStats } from "@/lib/queries";
import { TopPlayersBarChart, GoalsDistributionPie } from "@/components/charts/charts";

export const metadata = { title: "Classements — Tally Carreaux" };

const MEDALS = ["🥇", "🥈", "🥉"];

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
      <h2 className="font-display font-semibold mb-3">{title}</h2>
      <ol className="space-y-2.5 text-sm">
        {players.slice(0, 5).map((p, i) => (
          <li key={p.name} className="flex justify-between items-center">
            <span className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm">
                {i < 3 ? MEDALS[i] : <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
              </span>
              <span className="font-medium">{p.name}</span>
            </span>
            <span className="font-bold text-tally">{p.value} <span className="font-normal text-muted-foreground text-xs">{metric}</span></span>
          </li>
        ))}
        {players.length === 0 && <p className="text-muted-foreground">Aucune donnée.</p>}
      </ol>
    </section>
  );
}

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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold font-display">Classements</h1>

      {/* Classement par équipe */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3">Classement du championnat</h2>

        {/* Vue tableau (desktop) */}
        <div className="hidden sm:block card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                <th className="py-3 px-4 font-medium">#</th>
                <th className="py-3 px-4 font-medium">Équipe</th>
                <th className="py-3 px-3 font-medium text-center">MJ</th>
                <th className="py-3 px-3 font-medium text-center">V</th>
                <th className="py-3 px-3 font-medium text-center">N</th>
                <th className="py-3 px-3 font-medium text-center">D</th>
                <th className="py-3 px-3 font-medium text-center">BP</th>
                <th className="py-3 px-3 font-medium text-center">BC</th>
                <th className="py-3 px-3 font-medium text-center">Diff</th>
                <th className="py-3 px-4 font-medium text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map(({ team, stats: s, points }, i) => (
                <tr key={team.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: i === 0 ? "#F59E0B" : team.primary_color }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-2 font-semibold">
                      {team.logo_url ? (
                        <Image src={team.logo_url} alt={team.name} width={24} height={24} className="rounded-full object-cover" />
                      ) : (
                        <span className="w-6 h-6 rounded-full" style={{ backgroundColor: team.primary_color }} />
                      )}
                      {team.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">{s?.matches_played ?? 0}</td>
                  <td className="py-3 px-3 text-center">{s?.wins ?? 0}</td>
                  <td className="py-3 px-3 text-center">{s?.draws ?? 0}</td>
                  <td className="py-3 px-3 text-center">{s?.losses ?? 0}</td>
                  <td className="py-3 px-3 text-center">{s?.goals_scored ?? 0}</td>
                  <td className="py-3 px-3 text-center">{s?.goals_conceded ?? 0}</td>
                  <td className="py-3 px-3 text-center font-medium">
                    {(s?.goal_difference ?? 0) > 0 ? "+" : ""}{s?.goal_difference ?? 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="inline-block px-2.5 py-1 rounded-full font-bold text-white text-xs"
                      style={{ backgroundColor: team.primary_color }}
                    >
                      {points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vue cartes (mobile) */}
        <div className="sm:hidden flex flex-col gap-3">
          {standings.map(({ team, stats: s, points }, i) => (
            <div
              key={team.id}
              className="card p-4 relative overflow-hidden"
              style={{ borderLeftWidth: 4, borderLeftColor: team.primary_color }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: i === 0 ? "#F59E0B" : team.primary_color }}
                  >
                    {i === 0 ? "🥇" : i + 1}
                  </span>
                  {team.logo_url ? (
                    <Image src={team.logo_url} alt={team.name} width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: team.primary_color }} />
                  )}
                  <span className="font-semibold">{team.name}</span>
                </span>
                <span
                  className="score-numeral text-lg text-white px-3 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: team.primary_color }}
                >
                  {points} <span className="text-[10px] font-normal">PTS</span>
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-muted rounded-xl py-2.5">
                <div><p className="text-muted-foreground">MJ</p><p className="font-bold text-sm">{s?.matches_played ?? 0}</p></div>
                <div><p className="text-muted-foreground">V</p><p className="font-bold text-sm">{s?.wins ?? 0}</p></div>
                <div><p className="text-muted-foreground">N</p><p className="font-bold text-sm">{s?.draws ?? 0}</p></div>
                <div><p className="text-muted-foreground">D</p><p className="font-bold text-sm">{s?.losses ?? 0}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 bg-muted rounded-xl py-2.5">
                <div><p className="text-muted-foreground">BP</p><p className="font-bold text-sm">{s?.goals_scored ?? 0}</p></div>
                <div><p className="text-muted-foreground">BC</p><p className="font-bold text-sm">{s?.goals_conceded ?? 0}</p></div>
                <div>
                  <p className="text-muted-foreground">Diff</p>
                  <p className="font-bold text-sm">{(s?.goal_difference ?? 0) > 0 ? "+" : ""}{s?.goal_difference ?? 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
          <h2 className="font-display font-semibold mb-2">Top buteurs</h2>
          <TopPlayersBarChart data={byGoals.slice(0, 8)} label="Buts" />
        </div>
        <div className="card p-5">
          <h2 className="font-display font-semibold mb-2">Répartition des buts par équipe</h2>
          <GoalsDistributionPie data={goalsPerTeam} />
        </div>
      </div>
    </div>
  );
}

export const revalidate = 0;
