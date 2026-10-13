"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MonPronostic } from "@/lib/pronostics";
import { PredictionCard, type ItemPronostic } from "./prediction-card";
import { PseudoForm } from "./pseudo-form";
import { usePredictor } from "./use-predictor";

/**
 * Liste de cartes de pronostic pour les matchs ouverts.
 * Gère l'identité du visiteur : pseudo à choisir au premier passage, puis ses pronostics existants.
 */
export function PredictionPanel({ items }: { items: ItemPronostic[] }) {
  const router = useRouter();
  const { identite, pret, oublier } = usePredictor();
  const [mes, setMes] = useState<Record<string, MonPronostic>>({});

  useEffect(() => {
    if (!identite) {
      setMes({});
      return;
    }
    let annule = false;
    createClient()
      .rpc("my_predictions", { p_predictor: identite.id })
      .then(({ data }) => {
        if (annule || !data) return;
        const table: Record<string, MonPronostic> = {};
        (data as MonPronostic[]).forEach((p) => (table[p.match_id] = p));
        setMes(table);
      });
    return () => {
      annule = true;
    };
  }, [identite]);

  const enregistre = useCallback(
    (p: MonPronostic) => {
      setMes((prev) => ({ ...prev, [p.match_id]: p }));
      router.refresh(); // met à jour la répartition des supporters
    },
    [router]
  );

  if (!pret) return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  if (!identite) return <PseudoForm />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>
          Pronostiqueur : <strong>{identite.pseudo}</strong>
        </span>
        <button onClick={oublier} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <LogOut size={13} /> Ce n&apos;est pas moi
        </button>
      </div>
      <div className={items.length > 1 ? "grid gap-5 lg:grid-cols-2" : "mx-auto grid w-full max-w-xl gap-5"}>
        {items.map((item) => (
          <PredictionCard
            key={item.match.id}
            item={item}
            identite={identite}
            mine={mes[item.match.id]}
            onSaved={enregistre}
            onUnknown={oublier}
          />
        ))}
      </div>
    </div>
  );
}
