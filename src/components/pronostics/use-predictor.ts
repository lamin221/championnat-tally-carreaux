"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { messageErreur } from "@/lib/pronostics";

const CLE = "tc-pronostiqueur";
const EVENEMENT = "tc-pronostiqueur-change";

export interface Identite {
  id: string;
  pseudo: string;
}

function lire(): Identite | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const v = JSON.parse(brut) as Identite;
    return v?.id && v?.pseudo ? v : null;
  } catch {
    return null;
  }
}

/**
 * Identité du pronostiqueur : un pseudo + un identifiant secret gardés dans le navigateur.
 * Pas de compte : si le visiteur vide les données de son navigateur, il doit choisir un nouveau pseudo.
 */
export function usePredictor() {
  const [identite, setIdentite] = useState<Identite | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const maj = () => setIdentite(lire());
    maj();
    setPret(true);
    // Garde tous les composants de la page synchronisés
    window.addEventListener(EVENEMENT, maj);
    window.addEventListener("storage", maj);
    return () => {
      window.removeEventListener(EVENEMENT, maj);
      window.removeEventListener("storage", maj);
    };
  }, []);

  /** Crée le profil. Renvoie un message d'erreur, ou null si tout va bien. */
  const inscrire = useCallback(async (pseudo: string): Promise<string | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_predictor", { p_pseudo: pseudo });
    if (error || !data) return messageErreur(error?.message ?? "");
    window.localStorage.setItem(CLE, JSON.stringify({ id: data as string, pseudo: pseudo.trim() }));
    window.dispatchEvent(new Event(EVENEMENT));
    return null;
  }, []);

  const oublier = useCallback(() => {
    window.localStorage.removeItem(CLE);
    window.dispatchEvent(new Event(EVENEMENT));
  }, []);

  return { identite, pret, inscrire, oublier };
}
