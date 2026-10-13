"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { pointsGagnes, type Choix, type MonPronostic } from "@/lib/pronostics";
import type { Match, Team } from "@/types/database";
import { usePredictor } from "./use-predictor";

export interface MatchTermine {
  match: Match;
  home: Team;
  away: Team;
}

/** Résultats de mes pronostics sur les matchs terminés, avec les points gagnés. */
export function MyResults({ matches }: { matches: MatchTermine[] }) {
  const { identite } = usePredictor();
  const [mes, setMes] = useState<MonPronostic[] | null>(null);

  useEffect(() => {
    if (!identite) {
      setMes(null);
      return;
    }
    let annule = false;
    createClient()
      .rpc("my_predictions", { p_predictor: identite.id })
      .then(({ data }) => !annule && setMes((data ?? []) as MonPronostic[]));
    return () => {
      annule = true;
    };
  }, [identite]);

  if (!identite || !mes) return null;

  const lignes = matches
    .map((m) => ({ ...m, prono: mes.find((p) => p.match_id === m.match.id) }))
    .filter((l): l is MatchTermine & { prono: MonPronostic } => Boolean(l.prono));

  if (lignes.length === 0) return null;

  const libelle = (c: Choix, m: MatchTermine) => (c === "home" ? m.home.name : c === "away" ? m.away.name : "Match nul");
  const total = lignes.reduce(
    (s, l) => s + pointsGagnes(l.prono, Number(l.match.home_score ?? 0), Number(l.match.away_score ?? 0)),
    0
  );

  return (
    <section className="card p-5 sm:p-7">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Mes résultats</h2>
        <p className="text-sm text-muted-foreground">
          <span className="score-numeral text-3xl text-foreground">{total}</span> pts
        </p>
      </div>
      <ul className="space-y-2">
        {lignes.map((l) => {
          const hs = Number(l.match.home_score ?? 0);
          const as = Number(l.match.away_score ?? 0);
          const pts = pointsGagnes(l.prono, hs, as);
          return (
            <li key={l.match.id} className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {l.home.name} {hs} – {as} {l.away.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  Mon pronostic : {libelle(l.prono.pick, l)}
                  {l.prono.home_goals != null ? ` (${l.prono.home_goals}-${l.prono.away_goals})` : ""}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                  pts >= 5
                    ? "bg-yellow-400 text-amber-950"
                    : pts > 0
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {pts > 0 ? `+${pts}` : "0"} pt{pts > 1 ? "s" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
