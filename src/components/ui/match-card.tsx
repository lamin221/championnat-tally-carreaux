import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { TeamBadge } from "./team-badge";
import type { Match, Team } from "@/types/database";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  termine: { label: "TERMINÉ", className: "bg-white/15 text-white" },
  en_cours: { label: "● EN DIRECT", className: "bg-red-500 text-white" },
  a_venir: { label: "À VENIR", className: "bg-white/15 text-white" },
  annule: { label: "ANNULÉ", className: "bg-white/10 text-white/60" },
};

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
  const dateLabel = format(parseISO(match.match_date), "d MMM", { locale: fr }).toUpperCase();
  const status = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.a_venir;

  const colorA = homeTeam.primary_color ?? "#DC2626";
  const colorB = awayTeam.primary_color ?? "#1E40AF";

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col gap-4 text-white active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg transition-all animate-slide-up"
      style={{
        background: `linear-gradient(135deg, ${colorA}cc 0%, #0f0b2e 55%, ${colorB}cc 100%)`,
      }}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className={`px-2.5 py-1 rounded-full font-bold tracking-wide ${status.className}`}>
          {status.label}
        </span>
        <span className="flex items-center gap-1 text-white/60">
          {dateLabel} · <MapPin size={11} className="inline" /> {match.venue}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center p-1">
            <TeamBadge team={homeTeam} size={28} showName={false} />
          </div>
          <span className="text-xs font-medium text-center truncate w-full">{homeTeam.name}</span>
        </div>

        {isFinished ? (
          <span className="score-numeral text-2xl sm:text-3xl shrink-0 px-2">
            {match.home_score}-{match.away_score}
          </span>
        ) : (
          <span className="text-sm font-bold text-white/70 shrink-0 px-2">VS</span>
        )}

        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center p-1">
            <TeamBadge team={awayTeam} size={28} showName={false} />
          </div>
          <span className="text-xs font-medium text-center truncate w-full">{awayTeam.name}</span>
        </div>
      </div>
    </Link>
  );
}
