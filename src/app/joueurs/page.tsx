import Link from "next/link";
import Image from "next/image";
import { getTeams, getPlayers, getPlayerStats } from "@/lib/queries";

export const metadata = { title: "Joueurs — Tally Carreaux" };

export default async function JoueursPage() {
  const [teams, players, stats] = await Promise.all([
    getTeams(),
    getPlayers(),
    getPlayerStats(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Joueurs</h1>
      {teams.map((team) => (
        <section key={team.id}>
          <h2 className="font-semibold text-lg mb-3" style={{ color: team.primary_color }}>
            {team.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players
              .filter((p) => p.team_id === team.id)
              .map((player) => {
                const s = stats.find((st) => st.player_id === player.id);
                return (
                  <Link
                    key={player.id}
                    href={`/joueurs/${player.id}`}
                    className="card p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    {player.photo_url ? (
                      <Image
                        src={player.photo_url}
                        alt={player.full_name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: team.primary_color }}
                      >
                        {player.jersey_number}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{player.full_name}</p>
                      <p className="text-xs text-foreground/60">
                        {player.position} · {s?.goals ?? 0} buts · {s?.assists ?? 0} passes
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}

export const revalidate = 0;
