import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { Match, Team } from "@/types/database";

/** Invitation sur l'accueil : « Qui est ton homme du match ? » pendant la durée du vote. */
export function MotmTeaser({ match, home, away }: { match: Match; home: Team; away: Team }) {
  return (
    <Link
      href={`/matchs/${match.id}#vote`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-yellow-400/15 blur-3xl transition duration-500 group-hover:scale-150" />
      <div className="relative flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 shadow-lg">
          <Star size={22} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">Qui est ton homme du match ?</h2>
          <p className="mt-1 text-sm text-white/65">
            {home.name} {match.home_score} – {match.away_score} {away.name} : vote pour le meilleur joueur.
          </p>
        </div>
      </div>
      <span className="relative inline-flex items-center gap-2 text-sm font-semibold text-yellow-300">
        Voter <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
      </span>
    </Link>
  );
}
