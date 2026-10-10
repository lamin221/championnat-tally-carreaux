import Link from "next/link";
import { ArrowRight, Goal } from "lucide-react";
import { TeamBadge } from "@/components/ui/team-badge";
import { CountUp } from "@/components/home/count-up";
import type { Team, TeamStats } from "@/types/database";

/** Grand panneau d'équipe pour la page Équipes : bilan, buteur du moment, accès à la fiche. */
export function TeamPanel({
  team,
  stats,
  topScorer,
  playersCount,
}: {
  team: Team;
  stats?: TeamStats;
  topScorer: { name: string; goals: number } | null;
  playersCount: number;
}) {
  const couleur = team.primary_color || "#1E40AF";
  const clair = `color-mix(in srgb, ${couleur} 55%, white)`;
  const v = Number(stats?.wins ?? 0);
  const n = Number(stats?.draws ?? 0);
  const d = Number(stats?.losses ?? 0);
  const total = v + n + d;

  return (
    <Link
      href={`/equipes/${team.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-1.5 hover:border-yellow-400/40 hover:shadow-2xl sm:p-8"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${clair}, transparent)` }} />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl transition duration-500 group-hover:scale-125"
        style={{ background: `color-mix(in srgb, ${couleur} 55%, transparent)` }}
      />

      <div className="relative flex items-center gap-5">
        <div className="rounded-full bg-white/10 p-1.5 shadow-xl ring-2" style={{ ["--tw-ring-color" as string]: clair }}>
          <TeamBadge team={team} size={84} showName={false} />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
            {team.name}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {playersCount} joueur{playersCount > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Bilan */}
      <div className="relative mt-8">
        <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.07]">
          {total > 0 && (
            <>
              <div className="bg-emerald-500" style={{ flexGrow: v }} />
              <div className="bg-amber-400" style={{ flexGrow: n }} />
              <div className="bg-red-500" style={{ flexGrow: d }} />
            </>
          )}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { l: "Matchs", v: Number(stats?.matches_played ?? 0), c: "text-white" },
            { l: "Victoires", v, c: "text-emerald-300" },
            { l: "Nuls", v: n, c: "text-amber-300" },
            { l: "Défaites", v: d, c: "text-red-300" },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl bg-white/5 py-3">
              <p className={`score-numeral text-3xl leading-none ${x.c}`}>
                <CountUp value={x.v} />
              </p>
              <p className="mt-1.5 text-[10px] uppercase tracking-widest text-white/50">{x.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-2 text-white/60">
          <Goal size={16} className="text-yellow-300" />
          Buteur du moment
        </span>
        <span className="truncate font-semibold">
          {topScorer && topScorer.goals > 0 ? `${topScorer.name} (${topScorer.goals})` : "—"}
        </span>
      </div>

      <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-yellow-300">
        Voir la fiche de l&apos;équipe
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
      </span>
    </Link>
  );
}
