"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Garde la page à jour pendant un match, sans rien afficher.
 * - Écoute Supabase Realtime (matchs, buts, sanctions) et recharge les données à chaque changement.
 * - Filet de sécurité : rechargement toutes les 20 s si `sondage` est activé (match en cours).
 *
 * Sans `matchId`, écoute tous les matchs (utile sur l'accueil pour voir un coup d'envoi).
 */
export function LiveRefresher({
  matchId,
  sondage = false,
  annoncerButs = false,
}: {
  matchId?: string;
  sondage?: boolean;
  annoncerButs?: boolean;
}) {
  const router = useRouter();
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Plusieurs changements rapprochés (but + score) ne provoquent qu'un seul rechargement.
    const rafraichir = () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      minuteur.current = setTimeout(() => router.refresh(), 400);
    };

    const filtreMatch = matchId ? { filter: `id=eq.${matchId}` } : {};
    const filtreEvenement = matchId ? { filter: `match_id=eq.${matchId}` } : {};

    const canal = supabase
      .channel(`direct-${matchId ?? "tous"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", ...filtreMatch }, rafraichir)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals", ...filtreEvenement },
        (payload: { eventType: string }) => {
          if (annoncerButs && payload.eventType === "INSERT") toast("⚽ But !");
          rafraichir();
        }
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "sanctions", ...filtreEvenement }, rafraichir)
      .subscribe();

    const sondeur = sondage
      ? setInterval(() => {
          if (document.visibilityState === "visible") router.refresh();
        }, 20000)
      : null;

    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      if (sondeur) clearInterval(sondeur);
      supabase.removeChannel(canal);
    };
  }, [matchId, sondage, annoncerButs, router]);

  return null;
}
