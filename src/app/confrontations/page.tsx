import { getHeadToHead, getTeams, getMatches } from "@/lib/queries";
import { TeamBadge } from "@/components/ui/team-badge";
import { MatchCard } from "@/components/ui/match-card";
import { StatCard } from "@/components/ui/stat-card";
import { Swords, Goal, Handshake } from "lucide-react";

export const metadata = { title: "Confrontations — Tally Carreaux" };

export default async function ConfrontationsPage() {
  const [h2h, teams, matches] = await Promise.all([getHeadToHead(), getTeams(), getMatches()]);
  const [teamA, teamB] = teams;
  const finished = matches.filter((m) => m.status === "termine");
  const avgGoals = h2h && h2h.total_matches > 0
    ? ((h2h.total_home_goals + h2h.total_away_goals) / h2h.total_matches).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Swords /> Confrontations directes
      </h1>

      <div className="card p-6 flex items-center justify-around">
        <TeamBadge team={teamA} size={48} />
        <span className="text-3xl font-bold">VS</span>
        <TeamBadge team={teamB} size={48} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Confrontations totales" value={h2h?.total_matches ?? 0} icon={Swords} />
        <StatCard label={`Victoires ${teamA?.name}`} value={h2h?.home_wins_as_home ?? 0} icon={Goal} accent="tally" />
        <StatCard label={`Victoires ${teamB?.name}`} value={h2h?.away_wins_as_away ?? 0} icon={Goal} accent="carreaux" />
        <StatCard label="Matchs nuls" value={h2h?.draws ?? 0} icon={Handshake} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label={`Buts ${teamA?.name}`} value={h2h?.total_home_goals ?? 0} icon={Goal} />
        <StatCard label={`Buts ${teamB?.name}`} value={h2h?.total_away_goals ?? 0} icon={Goal} />
      </div>
      <StatCard label="Moyenne de buts par rencontre" value={avgGoals} icon={Goal} />

      <div>
        <h2 className="font-semibold text-lg mb-3">Derniers résultats</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {finished.slice(0, 6).map((m) => {
            const home = teams.find((t) => t.id === m.home_team_id);
            const away = teams.find((t) => t.id === m.away_team_id);
            if (!home || !away) return null;
            return <MatchCard key={m.id} match={m} homeTeam={home} awayTeam={away} />;
          })}
        </div>
      </div>
    </div>
  );
}

export const revalidate = 0;
