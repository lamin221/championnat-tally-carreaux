import { Crown } from "lucide-react";
import { TeamBadge } from "@/components/ui/team-badge";
import { CountUp } from "@/components/home/count-up";
import type { Team, TeamStats } from "@/types/database";

export type Standing = { team: Team; stats?: TeamStats; points: number };

const PANEL =
  "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] text-white shadow-xl shadow-blue-950/30";

const signe = (n: number) => (n > 0 ? `+${n}` : `${n}`);

function Rang({ i }: { i: number }) {
  return i === 0 ? (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-amber-950 shadow-lg shadow-yellow-500/40">
      <Crown size={16} />
    </span>
  ) : (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-sm font-bold text-white/80">
      {i + 1}
    </span>
  );
}

/** Classement des équipes : tableau sur grand écran, cartes sur mobile. */
export function StandingsPanel({ standings }: { standings: Standing[] }) {
  return (
    <div className={PANEL}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />

      {/* Tableau (≥ sm) */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-widest text-white/50">
              <th className="px-5 py-4 font-medium">#</th>
              <th className="px-3 py-4 font-medium">Équipe</th>
              {["MJ", "V", "N", "D", "BP", "BC", "Diff"].map((h) => (
                <th key={h} className="px-3 py-4 text-center font-medium">{h}</th>
              ))}
              <th className="px-6 py-4 text-center font-medium text-yellow-300">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(({ team, stats: s, points }, i) => (
              <tr
                key={team.id}
                className={`border-b border-white/5 last:border-0 transition hover:bg-white/5 ${
                  i === 0 ? "bg-yellow-400/[0.07]" : ""
                }`}
              >
                <td className="px-5 py-4"><Rang i={i} /></td>
                <td className="px-3 py-4">
                  <span className="flex items-center gap-3 font-semibold">
                    <span className="rounded-full bg-white/10 p-0.5 ring-1 ring-white/20">
                      <TeamBadge team={team} size={30} showName={false} />
                    </span>
                    {team.name}
                  </span>
                </td>
                <td className="px-3 py-4 text-center text-white/80">{s?.matches_played ?? 0}</td>
                <td className="px-3 py-4 text-center text-emerald-300">{s?.wins ?? 0}</td>
                <td className="px-3 py-4 text-center text-amber-300">{s?.draws ?? 0}</td>
                <td className="px-3 py-4 text-center text-red-300">{s?.losses ?? 0}</td>
                <td className="px-3 py-4 text-center text-white/80">{s?.goals_scored ?? 0}</td>
                <td className="px-3 py-4 text-center text-white/80">{s?.goals_conceded ?? 0}</td>
                <td className="px-3 py-4 text-center font-medium">{signe(Number(s?.goal_difference ?? 0))}</td>
                <td className="px-6 py-4 text-center">
                  <span className="score-numeral text-3xl text-yellow-300">
                    <CountUp value={points} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <div className="flex flex-col divide-y divide-white/10 sm:hidden">
        {standings.map(({ team, stats: s, points }, i) => (
          <div key={team.id} className={`p-5 ${i === 0 ? "bg-yellow-400/[0.07]" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-3">
                <Rang i={i} />
                <span className="rounded-full bg-white/10 p-0.5 ring-1 ring-white/20">
                  <TeamBadge team={team} size={32} showName={false} />
                </span>
                <span className="truncate font-semibold">{team.name}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="score-numeral text-3xl text-yellow-300">
                  <CountUp value={points} />
                </span>
                <span className="ml-1 text-[10px] text-white/50">PTS</span>
              </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-white/5 py-3 text-center text-xs">
              <div><p className="text-white/50">MJ</p><p className="text-base font-bold">{s?.matches_played ?? 0}</p></div>
              <div><p className="text-white/50">V</p><p className="text-base font-bold text-emerald-300">{s?.wins ?? 0}</p></div>
              <div><p className="text-white/50">N</p><p className="text-base font-bold text-amber-300">{s?.draws ?? 0}</p></div>
              <div><p className="text-white/50">D</p><p className="text-base font-bold text-red-300">{s?.losses ?? 0}</p></div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 py-3 text-center text-xs">
              <div><p className="text-white/50">BP</p><p className="text-base font-bold">{s?.goals_scored ?? 0}</p></div>
              <div><p className="text-white/50">BC</p><p className="text-base font-bold">{s?.goals_conceded ?? 0}</p></div>
              <div><p className="text-white/50">Diff</p><p className="text-base font-bold">{signe(Number(s?.goal_difference ?? 0))}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
