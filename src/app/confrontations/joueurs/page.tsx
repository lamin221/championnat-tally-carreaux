import { Users } from "lucide-react";
import { getTeams, getPlayers, getPlayerStats } from "@/lib/queries";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";
import { PlayerCard } from "@/components/ui/player-card";
import { Reveal } from "@/components/home/reveal";

export const metadata = { title: "Joueurs — Tally Carreaux" };

export default async function JoueursPage() {
  const [teams, players, stats] = await Promise.all([
    getTeams(),
    getPlayers(),
    getPlayerStats(),
  ]);
  const totalButs = stats.reduce((sum, s) => sum + s.goals, 0);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={Users}
        title="Joueurs"
        subtitle="Les effectifs des deux équipes, avec les statistiques de chaque joueur."
      >
        <HeaderChip label="Joueurs" value={players.length} />
        <HeaderChip label="Buts" value={totalButs} gold />
      </PageHeader>

      {teams.map((team) => {
        const effectif = players.filter((p) => p.team_id === team.id);
        const buts = stats
          .filter((s) => s.team_id === team.id)
          .reduce((sum, s) => sum + s.goals, 0);
        return (
          <section key={team.id}>
            <Reveal>
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-3">
                <h2 className="flex items-center gap-3 font-display text-2xl font-semibold uppercase tracking-wide">
                  <span
                    className="h-7 w-1.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${team.primary_color || "#1E40AF"} 60%, white)` }}
                  />
                  {team.name}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {effectif.length} joueur{effectif.length > 1 ? "s" : ""} · {buts} but{buts > 1 ? "s" : ""}
                </span>
              </div>
            </Reveal>

            {effectif.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun joueur dans cette équipe.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {effectif.map((player, i) => {
                  const s = stats.find((st) => st.player_id === player.id);
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
        );
      })}
    </div>
  );
}

export const revalidate = 0;
