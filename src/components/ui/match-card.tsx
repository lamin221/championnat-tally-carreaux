import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, ArrowUpRight } from "lucide-react";
import { TeamBadge } from "./team-badge";
import type { Match, Team } from "@/types/database";

const STATUS: Record<string, { label: string; className: string }> = {
  termine: { label: "Terminé", className: "bg-white/10 text-white/80" },
  en_cours: { label: "● En direct", className: "bg-red-500 text-white" },
  a_venir: { label: "À venir", className: "bg-yellow-400/15 text-yellow-300 ring-1 ring-yellow-400/30" },
  annule: { label: "Annulé", className: "bg-white/5 text-white/50" },
};

function Crest({ team, win }: { team: Team; win: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <div
        className={`rounded-full bg-white/10 p-1 ring-2 transition ${
          win ? "ring-yellow-300/80 shadow-[0_0_24px_rgba(250,204,21,0.4)]" : "ring-white/20"
        }`}
      >
        <TeamBadge team={team} size={44} showName={false} />
      </div>
      <span className="w-full truncate text-center text-xs font-semibold">{team.name}</span>
    </div>
  );
}

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
}: {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
}) {
  const finished = match.status === "termine";
  const hs = Number(match.home_score ?? 0);
  const as = Number(match.away_score ?? 0);
  const status = STATUS[match.status] ?? STATUS.a_venir;

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-5 text-white shadow-lg transition duration-300 hover:-translate-y-1.5 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-blue-900/40 active:scale-[0.99]"
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-600/25 blur-3xl transition duration-500 group-hover:scale-150" />

      <div className="relative flex items-center justify-between text-[11px]">
        <span className={`rounded-full px-2.5 py-1 font-semibold tracking-wide ${status.className}`}>
          {status.label}
        </span>
        <span className="capitalize text-white/55">
          {format(parseISO(match.match_date), "d MMM yyyy", { locale: fr })}
        </span>
      </div>

      <div className="relative flex items-center justify-between gap-2">
        <Crest team={homeTeam} win={finished && hs > as} />
        {finished ? (
          <span className="score-numeral shrink-0 px-1 text-4xl leading-none">
            <span className={hs > as ? "text-yellow-300" : ""}>{hs}</span>
            <span className="mx-1.5 text-white/30">–</span>
            <span className={as > hs ? "text-yellow-300" : ""}>{as}</span>
          </span>
        ) : (
          <span className="font-display shrink-0 px-1 text-lg text-white/40">VS</span>
        )}
        <Crest team={awayTeam} win={finished && as > hs} />
      </div>

      <div className="relative flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/55">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={12} className="text-yellow-300" />
          {match.venue}
        </span>
        <ArrowUpRight
          size={16}
          className="transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-yellow-300"
        />
      </div>
    </Link>
  );
}
