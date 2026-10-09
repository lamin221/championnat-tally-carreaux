import Link from "next/link";
import Image from "next/image";
import type { Player, Team } from "@/types/database";

/** Carte joueur "collection" : numéro en filigrane, photo cerclée, trois stats clés. */
export function PlayerCard({
  player,
  team,
  goals,
  assists,
  matches,
}: {
  player: Player;
  team: Team;
  goals: number;
  assists: number;
  matches: number;
}) {
  const couleur = team.primary_color || "#1E40AF";
  // Teinte éclaircie : reste lisible même si la couleur d'équipe est très foncée.
  const clair = `color-mix(in srgb, ${couleur} 55%, white)`;

  return (
    <Link
      href={`/joueurs/${player.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a1440] to-[#060b1f] p-5 text-white shadow-lg transition duration-300 hover:-translate-y-1.5 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-blue-900/40"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${clair}, transparent)` }} />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-5 font-display text-[110px] font-bold leading-none text-white/[0.05] transition duration-500 group-hover:text-yellow-300/15"
      >
        {player.jersey_number}
      </span>

      <div className="relative flex items-center gap-4">
        {player.photo_url ? (
          <Image
            src={player.photo_url}
            alt={player.full_name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover transition duration-300 group-hover:scale-105"
            style={{ boxShadow: `0 0 0 3px ${clair}` }}
          />
        ) : (
          <div
            className="grid h-16 w-16 place-items-center rounded-full font-display text-2xl font-bold text-white transition duration-300 group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${couleur}, #060b1f)`, boxShadow: `0 0 0 3px ${clair}` }}
          >
            {player.jersey_number}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{player.full_name}</p>
          {player.nickname && <p className="truncate text-xs text-white/55">« {player.nickname} »</p>}
          <span className="mt-1.5 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/80">
            {player.position}
          </span>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/5 py-3 text-center">
        <div>
          <p className="score-numeral text-2xl text-yellow-300">{goals}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/50">Buts</p>
        </div>
        <div>
          <p className="score-numeral text-2xl">{assists}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/50">Passes</p>
        </div>
        <div>
          <p className="score-numeral text-2xl">{matches}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/50">Matchs</p>
        </div>
      </div>
    </Link>
  );
}
