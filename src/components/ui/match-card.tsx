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
  const dateLabel = format(parseISO(match.match_date), "d MMM yyyy", { locale: fr });

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="card p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 hover:shadow-md active:scale-[0.98] hover:-translate-y-0.5 transition-all animate-slide-up"
    >
      <div className="flex items-center justify-between text-xs text-foreground/60">
        <span>{dateLabel} · {match.match_time?.slice(0, 5)}</span>
        <span className="flex items-center gap-1 shrink-0">
          <MapPin size={12} /> {match.venue}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TeamBadge team={homeTeam} />
        {isFinished ? (
          <span className="score-numeral text-xl sm:text-2xl shrink-0 px-2">
            {match.home_score} - {match.away_score}
          </span>
        ) : (
          <span className="text-xs sm:text-sm font-medium text-foreground/50 px-3 py-1 rounded-full bg-muted shrink-0">
            {match.status === "a_venir" ? "À venir" : match.status}
          </span>
        )}
        <TeamBadge team={awayTeam} />
      </div>
    </Link>
  );
}
