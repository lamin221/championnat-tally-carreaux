import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Star, Goal as GoalIcon, ShieldAlert } from "lucide-react";
import { getMatchById, getMatchDetails, getTeams, getPlayers } from "@/lib/queries";
import { TeamBadge } from "@/components/ui/team-badge";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const [teams, players, details] = await Promise.all([
    getTeams(),
    getPlayers(),
    getMatchDetails(id),
  ]);

  const homeTeam = teams.find((t) => t.id === match.home_team_id)!;
  const awayTeam = teams.find((t) => t.id === match.away_team_id)!;
  const findPlayer = (pid: string) => players.find((p) => p.id === pid);
  const motm = match.man_of_the_match_id ? findPlayer(match.man_of_the_match_id) : null;

  const dateLabel = format(parseISO(match.match_date), "EEEE d MMMM yyyy", { locale: fr });

  const lineupByTeam = (teamId: string) =>
    details.lineups.filter((l) => l.team_id === teamId).map((l) => findPlayer(l.player_id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="card p-8 text-center">
        <p className="text-sm text-foreground/60 capitalize">{dateLabel} · {match.match_time?.slice(0, 5)}</p>
        <p className="text-sm text-foreground/60 flex items-center justify-center gap-1 mt-1">
          <MapPin size={14} /> {match.venue}
        </p>
        <div className="flex items-center justify-center gap-8 mt-6">
          <TeamBadge team={homeTeam} size={56} />
          <span className="text-4xl font-bold tabular-nums">
            {match.home_score} - {match.away_score}
          </span>
          <TeamBadge team={awayTeam} size={56} />
        </div>
        {motm && (
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium bg-muted px-4 py-2 rounded-full">
            <Star size={16} className="text-yellow-500" /> Homme du match : {motm.full_name}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <GoalIcon size={18} /> Buteurs & passeurs
          </h2>
          {details.goals.length === 0 ? (
            <p className="text-sm text-foreground/50">Aucun but enregistré.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {details.goals.map((g) => {
                const scorer = findPlayer(g.scorer_id);
                const assist = g.assist_id ? findPlayer(g.assist_id) : null;
                return (
                  <li key={g.id} className="flex justify-between">
                    <span>
                      ⚽ {scorer?.full_name}{g.is_own_goal ? " (csc)" : ""}
                      {assist && <span className="text-foreground/50"> — passe de {assist.full_name}</span>}
                    </span>
                    {g.minute && <span className="text-foreground/50">{g.minute}&apos;</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <ShieldAlert size={18} /> Sanctions
          </h2>
          {details.sanctions.length === 0 ? (
            <p className="text-sm text-foreground/50">Aucune sanction.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {details.sanctions.map((s) => {
                const player = findPlayer(s.player_id);
                return (
                  <li key={s.id} className="flex justify-between">
                    <span>
                      {s.type === "exclusion_definitive" ? "🟥" : "🟨"} {player?.full_name}
                    </span>
                    {s.minute && <span className="text-foreground/50">{s.minute}&apos;</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card p-5">
          <h2 className="font-semibold mb-3">Composition {homeTeam.name}</h2>
          <ul className="text-sm space-y-1">
            {lineupByTeam(homeTeam.id).map((p) => (
              <li key={p!.id}>#{p!.jersey_number} {p!.full_name}</li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="font-semibold mb-3">Composition {awayTeam.name}</h2>
          <ul className="text-sm space-y-1">
            {lineupByTeam(awayTeam.id).map((p) => (
              <li key={p!.id}>#{p!.jersey_number} {p!.full_name}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export const revalidate = 0;
