import Link from "next/link";
import { Swords } from "lucide-react";
import { TeamBadge } from "@/components/ui/team-badge";
import { CountUp } from "./count-up";
import { delay } from "@/lib/anim";
import type { Team, TeamStats } from "@/types/database";

// Tableau de bord "face-à-face" : les deux équipes, le cumul de buts, la répartition
// victoires / nuls et des barres de comparaison qui se remplissent au scroll.
// Équipe A = rouge, équipe B = bleu (même convention que les StatCard du site).

function Crest({ team }: { team: Team }) {
  return (
    <Link
      href={`/equipes/${team.id}`}
      className="group flex min-w-0 flex-1 flex-col items-center gap-3 text-center"
    >
      <div className="rounded-full bg-white/10 p-1.5 ring-2 ring-white/25 shadow-xl transition duration-300 group-hover:scale-105 group-hover:ring-yellow-300/70">
        <TeamBadge team={team} size={64} showName={false} />
      </div>
      <span className="w-full truncate font-display text-base font-semibold uppercase tracking-wide transition group-hover:text-yellow-300 sm:text-xl">
        {team.name}
      </span>
    </Link>
  );
}

function CompareRow({
  label,
  a,
  b,
  suffix = "",
  d,
}: {
  label: string;
  a: number;
  b: number;
  suffix?: string;
  d: number;
}) {
  const max = Math.max(a, b);
  const pa = max ? (a / max) * 100 : 0;
  const pb = max ? (b / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <span className="score-numeral text-2xl leading-none text-red-400">
          <CountUp value={a} suffix={suffix} />
        </span>
        <span className="pb-0.5 text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</span>
        <span className="score-numeral text-2xl leading-none text-blue-400">
          <CountUp value={b} suffix={suffix} />
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        <div className="flex h-2.5 justify-end overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="bar-grow h-full origin-right rounded-full bg-gradient-to-l from-red-400 to-red-700"
            style={{ width: `${pa}%`, ...delay(d) }}
          />
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="bar-grow h-full origin-left rounded-full bg-gradient-to-r from-blue-400 to-blue-700"
            style={{ width: `${pb}%`, ...delay(d) }}
          />
        </div>
      </div>
    </div>
  );
}

export function VersusBoard({
  teamA,
  teamB,
  statsA,
  statsB,
  draws,
}: {
  teamA: Team;
  teamB: Team;
  statsA?: TeamStats;
  statsB?: TeamStats;
  draws: number;
}) {
  const winsA = Number(statsA?.wins ?? 0);
  const winsB = Number(statsB?.wins ?? 0);
  const goalsA = Number(statsA?.goals_scored ?? 0);
  const goalsB = Number(statsB?.goals_scored ?? 0);
  const concA = Number(statsA?.goals_conceded ?? 0);
  const concB = Number(statsB?.goals_conceded ?? 0);
  const pctA = Math.round(Number(statsA?.win_percentage ?? 0));
  const pctB = Math.round(Number(statsB?.win_percentage ?? 0));
  const totalIssues = winsA + draws + winsB;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-2xl shadow-blue-950/30 sm:p-10">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />

      <div className="relative">
        <div className="mb-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.3em] text-yellow-300/90">
          <Swords size={14} />
          Face-à-face
        </div>

        {/* Équipes + buts marqués */}
        <div className="flex items-center justify-between gap-3">
          <Crest team={teamA} />
          <div className="flex shrink-0 flex-col items-center px-1">
            <div className="score-numeral flex items-center gap-2 text-5xl leading-none sm:gap-4 sm:text-7xl">
              <CountUp value={goalsA} />
              <span className="text-white/30">–</span>
              <CountUp value={goalsB} />
            </div>
            <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/50">Buts marqués</span>
          </div>
          <Crest team={teamB} />
        </div>

        {/* Répartition victoires / nuls */}
        <div className="mt-10">
          <div className="bar-grow flex h-3 origin-left overflow-hidden rounded-full bg-white/[0.06]">
            {totalIssues > 0 && (
              <>
                <div className="bg-gradient-to-r from-red-700 to-red-500" style={{ flexGrow: winsA }} />
                <div className="bg-yellow-400/80" style={{ flexGrow: draws }} />
                <div className="bg-gradient-to-r from-blue-500 to-blue-700" style={{ flexGrow: winsB }} />
              </>
            )}
          </div>
          <div className="mt-2.5 flex justify-between text-xs">
            <span className="text-red-300">{winsA} victoire{winsA > 1 ? "s" : ""}</span>
            <span className="text-yellow-300">{draws} nul{draws > 1 ? "s" : ""}</span>
            <span className="text-blue-300">{winsB} victoire{winsB > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Comparatif */}
        <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 sm:gap-x-12">
          <CompareRow label="Victoires" a={winsA} b={winsB} d={100} />
          <CompareRow label="% de victoires" a={pctA} b={pctB} suffix="%" d={200} />
          <CompareRow label="Buts marqués" a={goalsA} b={goalsB} d={300} />
          <CompareRow label="Buts encaissés" a={concA} b={concB} d={400} />
        </div>
      </div>
    </section>
  );
}
