import Link from "next/link";
import { Shield, Swords } from "lucide-react";
import { getTeams, getTeamStats, getPlayers, getPlayerStats } from "@/lib/queries";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";
import { TeamPanel } from "@/components/ui/team-panel";
import { Reveal } from "@/components/home/reveal";

export const metadata = {
  title: "Équipes — Tally Carreaux",
  description: "Les deux équipes du championnat : bilan, effectif et buteur du moment.",
};

export default async function EquipesPage() {
  const [teams, teamStats, players, playerStats] = await Promise.all([
    getTeams(),
    getTeamStats(),
    getPlayers(),
    getPlayerStats(),
  ]);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader
        icon={Shield}
        title="Équipes"
        subtitle="Les deux équipes du championnat : bilan, effectif et joueurs en forme."
      >
        <HeaderChip label="Équipes" value={teams.length} />
        <HeaderChip label="Joueurs" value={players.length} gold />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {teams.map((team, i) => {
          const meilleur = playerStats
            .filter((p) => p.team_id === team.id)
            .sort((a, b) => b.goals - a.goals)[0];
          return (
            <Reveal key={team.id} delay={i * 120} className="h-full">
              <TeamPanel
                team={team}
                stats={teamStats.find((s) => s.team_id === team.id)}
                topScorer={meilleur ? { name: meilleur.nickname || meilleur.full_name, goals: meilleur.goals } : null}
                playersCount={players.filter((p) => p.team_id === team.id).length}
              />
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <Link
          href="/confrontations"
          className="card group flex items-center justify-between gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#0a1440] to-[#060b1f] text-yellow-300">
              <Swords size={22} />
            </span>
            <span>
              <span className="block font-semibold">Voir le face-à-face</span>
              <span className="block text-sm text-muted-foreground">Bilan complet des confrontations directes</span>
            </span>
          </span>
          <span className="text-2xl text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground">→</span>
        </Link>
      </Reveal>
    </div>
  );
}

export const revalidate = 0;
