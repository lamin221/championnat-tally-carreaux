import { getRecords, getTeams, getPlayers } from "@/lib/queries";
import { Trophy, Goal, Handshake, ShieldAlert, Flame } from "lucide-react";

export const metadata = { title: "Records — Tally Carreaux" };

export default async function RecordsPage() {
  const [records, teams, players] = await Promise.all([getRecords(), getTeams(), getPlayers()]);
  const findTeam = (id?: string) => teams.find((t) => t.id === id)?.name ?? "—";
  const findPlayer = (id?: string) => players.find((p) => p.id === id)?.full_name ?? "—";

  const items = [
    {
      icon: Trophy,
      title: "Plus large victoire",
      value: records.biggestWin
        ? `${findTeam(records.biggestWin.home_team_id)} ${records.biggestWin.home_score} - ${records.biggestWin.away_score} ${findTeam(records.biggestWin.away_team_id)}`
        : "Aucune donnée",
    },
    {
      icon: Goal,
      title: "Match avec le plus de buts",
      value: records.mostGoals
        ? `${findTeam(records.mostGoals.home_team_id)} ${records.mostGoals.home_score} - ${records.mostGoals.away_score} ${findTeam(records.mostGoals.away_team_id)} (${records.mostGoals.total_goals} buts)`
        : "Aucune donnée",
    },
    {
      icon: Flame,
      title: "Le plus de buts dans un seul match (joueur)",
      value: records.playerGoals
        ? `${findPlayer(records.playerGoals.player_id)} — ${records.playerGoals.goals_in_match} buts`
        : "Aucune donnée",
    },
    {
      icon: Handshake,
      title: "Le plus de passes dans un seul match (joueur)",
      value: records.playerAssists
        ? `${findPlayer(records.playerAssists.player_id)} — ${records.playerAssists.assists_in_match} passes`
        : "Aucune donnée",
    },
    {
      icon: ShieldAlert,
      title: "Le plus grand nombre de sanctions dans un match",
      value: records.mostSanctions
        ? `${records.mostSanctions.sanctions_count} sanctions`
        : "Aucune donnée",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Records du championnat</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.title} className="card p-5 flex items-start gap-4">
            <item.icon className="text-tally shrink-0" size={28} />
            <div>
              <p className="text-sm text-foreground/60">{item.title}</p>
              <p className="font-semibold mt-1">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-foreground/50">
        Note : la « plus longue série de victoires » se calcule à partir de l&apos;historique complet des matchs
        et s&apos;affine à mesure que le championnat progresse.
      </p>
    </div>
  );
}

export const revalidate = 0;
