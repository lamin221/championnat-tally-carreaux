"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MatchCard } from "@/components/ui/match-card";
import { delay } from "@/lib/anim";
import type { Match, Team } from "@/types/database";

type Filtre = "tous" | "termine" | "a_venir";

/** Liste des matchs avec filtres (Tous / Terminés / À venir) et regroupement par mois. */
export function MatchesBrowser({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  const [filtre, setFiltre] = useState<Filtre>("tous");

  const compte = useMemo(
    () => ({
      tous: matches.length,
      termine: matches.filter((m) => m.status === "termine").length,
      a_venir: matches.filter((m) => m.status === "a_venir").length,
    }),
    [matches]
  );

  const groupes = useMemo(() => {
    const visibles = matches.filter((m) => filtre === "tous" || m.status === filtre);
    const parMois = new Map<string, Match[]>();
    for (const m of visibles) {
      const cle = format(parseISO(m.match_date), "MMMM yyyy", { locale: fr });
      parMois.set(cle, [...(parMois.get(cle) ?? []), m]);
    }
    return Array.from(parMois.entries());
  }, [matches, filtre]);

  const findTeam = (id: string) => teams.find((t) => t.id === id);

  const onglets: { id: Filtre; label: string }[] = [
    { id: "tous", label: "Tous" },
    { id: "termine", label: "Terminés" },
    { id: "a_venir", label: "À venir" },
  ];

  let index = 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les matchs">
        {onglets.map((o) => (
          <button
            key={o.id}
            role="tab"
            aria-selected={filtre === o.id}
            onClick={() => setFiltre(o.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              filtre === o.id
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30"
                : "bg-muted text-muted-foreground hover:bg-border hover:text-foreground"
            }`}
          >
            {o.label}
            <span className={`ml-2 text-xs ${filtre === o.id ? "text-white/80" : "text-muted-foreground"}`}>
              {compte[o.id]}
            </span>
          </button>
        ))}
      </div>

      {groupes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Aucun match dans cette catégorie.
        </p>
      ) : (
        // La clé relance l'animation d'entrée à chaque changement de filtre
        <div key={filtre} className="flex flex-col gap-10">
          {groupes.map(([mois, liste]) => (
            <section key={mois}>
              <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-muted-foreground">
                <span className="h-px flex-1 bg-gradient-to-r from-yellow-500/60 to-transparent" />
                <span className="capitalize">{mois}</span>
                <span className="h-px flex-1 bg-gradient-to-l from-yellow-500/60 to-transparent" />
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {liste.map((match) => {
                  const home = findTeam(match.home_team_id);
                  const away = findTeam(match.away_team_id);
                  if (!home || !away) return null;
                  const d = Math.min(index++ * 70, 560);
                  return (
                    <div key={match.id} className="hero-in" style={delay(d)}>
                      <MatchCard match={match} homeTeam={home} awayTeam={away} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
