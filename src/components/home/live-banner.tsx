import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { TeamBadge } from "@/components/ui/team-badge";
import { LiveBadge } from "@/components/live/live-badge";
import { LiveNumber } from "@/components/live/live-number";
import type { Match, Team } from "@/types/database";

/** Bandeau affiché en haut de l'accueil tant qu'un match est en cours. */
export function LiveBanner({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  return (
    <div className="flex flex-col gap-4">
      {matches.map((m) => {
        const home = teams.find((t) => t.id === m.home_team_id);
        const away = teams.find((t) => t.id === m.away_team_id);
        if (!home || !away) return null;
        return (
          <Link
            key={m.id}
            href={`/matchs/${m.id}`}
            className="group relative overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-br from-[#2a0a12] via-[#0a1440] to-[#060b1f] p-5 text-white shadow-2xl shadow-red-900/30 transition hover:-translate-y-1 sm:p-7"
          >
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 animate-orb rounded-full bg-red-600/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 animate-orb rounded-full bg-blue-600/25 blur-3xl [animation-delay:-5s]" />

            <div className="relative flex items-center justify-between gap-3">
              <LiveBadge />
              <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <MapPin size={13} className="text-yellow-300" /> {m.venue}
              </span>
            </div>

            <div className="relative mt-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-white/10 p-1 ring-2 ring-white/25">
                  <TeamBadge team={home} size={52} showName={false} />
                </div>
                <span className="w-full truncate text-sm font-semibold">{home.name}</span>
              </div>

              <div className="score-numeral flex shrink-0 items-center gap-2 text-6xl leading-none sm:gap-4 sm:text-7xl">
                <LiveNumber value={Number(m.home_score ?? 0)} className="text-white" />
                <span className="text-white/30">–</span>
                <LiveNumber value={Number(m.away_score ?? 0)} className="text-white" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-white/10 p-1 ring-2 ring-white/25">
                  <TeamBadge team={away} size={52} showName={false} />
                </div>
                <span className="w-full truncate text-sm font-semibold">{away.name}</span>
              </div>
            </div>

            <span className="relative mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-yellow-300">
              Suivre le match en direct
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
