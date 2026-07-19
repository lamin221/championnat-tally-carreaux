import { getMatches, getTeams } from "@/lib/queries";
import { MatchCard } from "@/components/ui/match-card";

export const metadata = { title: "Historique des matchs — Tally Carreaux" };

export default async function MatchsPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()]);
  const findTeam = (id: string) => teams.find((t) => t.id === id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Historique des matchs</h1>
      {matches.length === 0 ? (
        <p className="text-foreground/50">Aucun match enregistré pour le moment.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => {
            const home = findTeam(match.home_team_id);
            const away = findTeam(match.away_team_id);
            if (!home || !away) return null;
            return <MatchCard key={match.id} match={match} homeTeam={home} awayTeam={away} />;
          })}
        </div>
      )}
    </div>
  );
}

export const revalidate = 0;
