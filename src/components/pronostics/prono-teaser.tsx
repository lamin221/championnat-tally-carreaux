import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { TeamBadge } from "@/components/ui/team-badge";
import type { Match, Team } from "@/types/database";

/** Invitation sur l'accueil : « Qui va gagner ? » pour le prochain match ouvert aux pronostics. */
export function PronoTeaser({ match, home, away }: { match: Match; home: Team; away: Team }) {
  return (
    <Link
      href="/pronostics"
      className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-red-600/20 blur-3xl transition duration-500 group-hover:scale-150" />
      <div className="relative flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 shadow-lg">
          <Target size={22} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">Qui va gagner ?</h2>
          <p className="mt-1 text-sm text-white/65">
            {home.name} contre {away.name} : donne ton pronostic et gagne des points.
          </p>
        </div>
      </div>
      <div className="relative flex items-center justify-between gap-5 sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 p-0.5 ring-2 ring-white/25">
            <TeamBadge team={home} size={34} showName={false} />
          </span>
          <span className="text-xs text-white/40">VS</span>
          <span className="rounded-full bg-white/10 p-0.5 ring-2 ring-white/25">
            <TeamBadge team={away} size={34} showName={false} />
          </span>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-300">
          Pronostiquer <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}
