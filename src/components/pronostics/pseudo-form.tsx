"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { usePredictor } from "./use-predictor";

/** Formulaire « Choisis ton pseudo » affiché avant le premier pronostic ou le premier vote. */
export function PseudoForm({
  description = "Pas besoin de compte. Ton pseudo apparaîtra dans le classement des pronostiqueurs.",
}: {
  description?: string;
}) {
  const { inscrire } = usePredictor();
  const [pseudo, setPseudo] = useState("");
  const [occupe, setOccupe] = useState(false);

  async function valider(e: React.FormEvent) {
    e.preventDefault();
    setOccupe(true);
    const erreur = await inscrire(pseudo);
    setOccupe(false);
    if (erreur) toast.error(erreur);
    else toast.success("C'est parti, tu peux pronostiquer !");
  }

  return (
    <form
      onSubmit={valider}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl sm:p-8"
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-yellow-400/15 blur-3xl" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 shadow-lg">
            <UserRound size={22} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">Choisis ton pseudo</h2>
            <p className="mt-1 text-sm text-white/65">{description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={20}
            placeholder="Ex. Moussa"
            aria-label="Ton pseudo"
            className="min-h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/40 focus:border-yellow-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={occupe || pseudo.trim().length < 2}
            className="btn-sheen min-h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 font-bold text-amber-950 shadow-lg disabled:opacity-50"
          >
            Commencer
          </button>
        </div>
        <p className="text-xs text-white/45">
          Ton profil est enregistré dans ce navigateur : si tu effaces ses données, il faudra choisir un nouveau pseudo.
        </p>
      </div>
    </form>
  );
}
