"use client";

import { Medal } from "lucide-react";
import type { LigneClassement } from "@/lib/pronostics";
import { usePredictor } from "./use-predictor";

const MEDAILLES = [
  "from-yellow-300 to-yellow-600 text-amber-950",
  "from-slate-200 to-slate-400 text-slate-800",
  "from-orange-300 to-amber-700 text-orange-950",
];

/** Classement des pronostiqueurs. Ta ligne est mise en évidence si tu as un pseudo. */
export function Leaderboard({ rows }: { rows: LigneClassement[] }) {
  const { identite } = usePredictor();

  return (
    <section className="card relative overflow-hidden p-5 sm:p-7">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-transparent" />
      <h2 className="mb-5 flex items-center gap-2.5 font-display text-lg font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0a1440] to-[#060b1f] text-yellow-300">
          <Medal size={18} />
        </span>
        Classement des pronostiqueurs
      </h2>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Le classement apparaîtra dès que les premiers matchs pronostiqués seront terminés.
        </p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const moi = identite?.pseudo.toLowerCase() === r.pseudo.toLowerCase();
            return (
              <li
                key={r.pseudo}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${
                  moi ? "bg-yellow-400/15 ring-1 ring-yellow-400/50" : "bg-muted"
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    i < 3 ? `bg-gradient-to-br shadow-md ${MEDAILLES[i]}` : "bg-background text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {r.pseudo} {moi && <span className="text-xs font-normal text-yellow-600">(toi)</span>}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {r.correct}/{r.played} bon{r.correct > 1 ? "s" : ""} résultat{r.correct > 1 ? "s" : ""} — {r.exact} score{r.exact > 1 ? "s" : ""} exact{r.exact > 1 ? "s" : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="score-numeral text-2xl">{r.points}</span>
                  <span className="ml-1 text-[11px] text-muted-foreground">pts</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
