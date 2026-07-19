import { notFound } from "next/navigation";
import Image from "next/image";
import { Goal, Handshake, Star, Clock, ShieldAlert, ShieldX } from "lucide-react";
import { getPlayerById, getPlayerStats, getTeams } from "@/lib/queries";
import { StatCard } from "@/components/ui/stat-card";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  const [stats, teams] = await Promise.all([getPlayerStats(), getTeams()]);
  const playerStats = stats.find((s) => s.player_id === id);
  const team = teams.find((t) => t.id === player.team_id);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="card p-8 flex items-center gap-6">
        {player.photo_url ? (
          <Image
            src={player.photo_url}
            alt={player.full_name}
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: team?.primary_color }}
          >
            {player.jersey_number}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{player.full_name}</h1>
          {player.nickname && <p className="text-foreground/60">« {player.nickname} »</p>}
          <p className="text-sm text-foreground/60 mt-1">
            {team?.name} · #{player.jersey_number} · {player.position}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Matchs joués" value={playerStats?.matches_played ?? 0} icon={Clock} />
        <StatCard label="Buts" value={playerStats?.goals ?? 0} icon={Goal} accent="tally" />
        <StatCard label="Passes décisives" value={playerStats?.assists ?? 0} icon={Handshake} accent="carreaux" />
        <StatCard label="Homme du match" value={playerStats?.man_of_the_match_count ?? 0} icon={Star} />
        <StatCard label="Contributions offensives" value={playerStats?.goal_contributions ?? 0} icon={Goal} />
        <StatCard label="Suspensions 2 min" value={playerStats?.suspensions_2min ?? 0} icon={ShieldAlert} />
        <StatCard label="Exclusions définitives" value={playerStats?.exclusions_definitives ?? 0} icon={ShieldX} />
      </div>
    </div>
  );
}

export const revalidate = 0;
