import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { TeamBadge } from "./team-badge";
import type { Match, Team } from "@/types/database";

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
}: {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
}) {
  const isFinished = match.status === "termine";
  const dateLabel = format(parseISO(match.match_date), "d MMMM yyyy", { locale: fr });

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="card p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all animate-slide-up"
    >
      <div className="flex items-center justify-between text-xs text-foreground/60">
        <span>{dateLabel} · {match.match_time?.slice(0, 5)}</span>
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {match.venue}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <TeamBadge team={homeTeam} />
        {isFinished ? (
          <span className="text-2xl font-bold tabular-nums">
            {match.home_score} - {match.away_score}
          </span>
        ) : (
          <span className="text-sm font-medium text-foreground/50 px-3 py-1 rounded-full bg-muted">
            {match.status === "a_venir" ? "À venir" : match.status}
          </span>
        )}
        <TeamBadge team={awayTeam} />
      </div>
    </Link>
  );
}
