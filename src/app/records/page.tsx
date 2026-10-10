import { Trophy, Goal, Handshake, ShieldAlert, Flame, Medal } from "lucide-react";
import { getRecords, getTeams, getPlayers } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { RecordCard } from "@/components/ui/record-card";
import { Reveal } from "@/components/home/reveal";
import { CountUp } from "@/components/home/count-up";

export const metadata = { title: "Records — Tally Carreaux" };

export default async function RecordsPage() {
  const [records, teams, players] = await Promise.all([getRecords(), getTeams(), getPlayers()]);
  const findTeam = (id?: string) => teams.find((t) => t.id === id)?.name ?? "—";
  const findPlayer = (id?: string) => players.find((p) => p.id === id)?.full_name ?? "—";

  const { biggestWin, mostGoals, playerGoals, playerAssists, mostSanctions } = records;
  const nodata = "Aucune donnée pour le moment";

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader
        icon={Medal}
        title="Records"
        subtitle="Les performances qui ont marqué l'histoire du championnat."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full md:col-span-2">
          <RecordCard
            featured
            icon={Trophy}
            title="Plus large victoire"
            big={
              biggestWin ? (
                <>
                  <CountUp value={Number(biggestWin.home_score)} />
                  <span className="text-white/30">–</span>
                  <CountUp value={Number(biggestWin.away_score)} />
                </>
              ) : (
                "—"
              )
            }
            caption={
              biggestWin
                ? `${findTeam(biggestWin.home_team_id)} contre ${findTeam(biggestWin.away_team_id)}`
                : nodata
            }
          />
        </Reveal>

        <Reveal delay={80} className="h-full">
          <RecordCard
            icon={Goal}
            title="Match avec le plus de buts"
            big={mostGoals ? <CountUp value={Number(mostGoals.total_goals)} /> : "—"}
            unit={mostGoals ? "buts" : undefined}
            caption={
              mostGoals
                ? `${findTeam(mostGoals.home_team_id)} ${mostGoals.home_score} – ${mostGoals.away_score} ${findTeam(mostGoals.away_team_id)}`
                : nodata
            }
          />
        </Reveal>

        <Reveal delay={160} className="h-full">
          <RecordCard
            icon={Flame}
            title="Le plus de buts dans un seul match (joueur)"
            big={playerGoals ? <CountUp value={Number(playerGoals.goals_in_match)} /> : "—"}
            unit={playerGoals ? "buts" : undefined}
            caption={playerGoals ? findPlayer(playerGoals.player_id) : nodata}
          />
        </Reveal>

        <Reveal delay={80} className="h-full">
          <RecordCard
            icon={Handshake}
            title="Le plus de passes décisives dans un seul match (joueur)"
            big={playerAssists ? <CountUp value={Number(playerAssists.assists_in_match)} /> : "—"}
            unit={playerAssists ? "passes" : undefined}
            caption={playerAssists ? findPlayer(playerAssists.player_id) : nodata}
          />
        </Reveal>

        <Reveal delay={160} className="h-full">
          <RecordCard
            icon={ShieldAlert}
            title="Le plus grand nombre de sanctions dans un match"
            big={mostSanctions ? <CountUp value={Number(mostSanctions.sanctions_count)} /> : "—"}
            unit={mostSanctions ? "sanctions" : undefined}
            caption={mostSanctions ? undefined : nodata}
          />
        </Reveal>
      </div>

      <p className="text-xs text-muted-foreground">
        Note : la « plus longue série de victoires » se calcule à partir de l&apos;historique complet des matchs
        et s&apos;affine à mesure que le championnat progresse.
      </p>
    </div>
  );
}

export const revalidate = 0;
