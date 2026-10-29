"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Crown, Star, Timer } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { messageErreurVote, type MonVote } from "@/lib/vote";
import { PseudoForm } from "@/components/pronostics/pseudo-form";
import { usePredictor } from "@/components/pronostics/use-predictor";
import type { Team } from "@/types/database";

export interface JoueurVote {
  id: string;
  nom: string;
  numero: number;
  teamId: string;
  photoUrl: string | null;
}

/**
 * Vote du public pour l'homme du match.
 * - Pendant le vote : le visiteur choisit un joueur ; les résultats ne s'affichent qu'après son vote.
 * - Vote terminé : on affiche le choix des supporters et on le compare à l'homme du match officiel.
 */
export function MotmVote({
  matchId,
  home,
  away,
  joueurs,
  comptes,
  ouvert,
  limite,
  officielId,
  children,
}: {
  children?: React.ReactNode;
  matchId: string;
  home: Team;
  away: Team;
  joueurs: JoueurVote[];
  comptes: Record<string, number>;
  ouvert: boolean;
  limite: number;
  officielId: string | null;
}) {
  const router = useRouter();
  const { identite, pret, oublier } = usePredictor();
  const [monVote, setMonVote] = useState<string | null>(null);
  const [choix, setChoix] = useState<string | null>(null);
  const [ajust, setAjust] = useState<Record<string, number>>({});
  const [occupe, setOccupe] = useState(false);

  // Mon vote existant
  useEffect(() => {
    if (!identite) {
      setMonVote(null);
      setChoix(null);
      return;
    }
    let annule = false;
    createClient()
      .rpc("my_motm_votes", { p_predictor: identite.id })
      .then(({ data }) => {
        if (annule || !data) return;
        const v = (data as MonVote[]).find((x) => x.match_id === matchId);
        setMonVote(v?.player_id ?? null);
        setChoix(v?.player_id ?? null);
      });
    return () => {
      annule = true;
    };
  }, [identite, matchId]);

  // Quand les chiffres du serveur arrivent, on abandonne l'ajustement local
  const cle = JSON.stringify(comptes);
  useEffect(() => setAjust({}), [cle]);

  const totaux = useMemo(() => {
    const t: Record<string, number> = { ...comptes };
    Object.entries(ajust).forEach(([id, d]) => (t[id] = (t[id] ?? 0) + d));
    return t;
  }, [comptes, ajust]);

  const total = Object.values(totaux).reduce((s, n) => s + n, 0);
  const classement = joueurs
    .map((j) => ({ ...j, votes: totaux[j.id] ?? 0 }))
    .filter((j) => j.votes > 0)
    .sort((a, b) => b.votes - a.votes);
  const gagnant = classement[0];
  const afficherResultats = !ouvert || monVote !== null;

  async function voter() {
    if (!identite || !choix) return;
    setOccupe(true);
    const { error } = await createClient().rpc("submit_motm_vote", {
      p_predictor: identite.id,
      p_match: matchId,
      p_player: choix,
    });
    setOccupe(false);
    if (error) {
      if (error.message.includes("predicteur_inconnu")) oublier();
      return toast.error(messageErreurVote(error.message));
    }
    setAjust((prev) => {
      const next = { ...prev };
      if (monVote) next[monVote] = (next[monVote] ?? 0) - 1;
      next[choix] = (next[choix] ?? 0) + 1;
      return next;
    });
    setMonVote(choix);
    toast.success("Vote enregistré, merci !");
    router.refresh();
  }

  const officiel = officielId ? joueurs.find((j) => j.id === officielId) : null;
  const limiteTexte = new Date(limite).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-5 text-white shadow-xl shadow-blue-950/30 sm:p-8">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-yellow-400/15 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold uppercase tracking-wide">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 shadow-lg">
              <Star size={20} />
            </span>
            Homme du match
          </h2>
          {ouvert ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Timer size={13} /> Vote ouvert jusqu&apos;à {limiteTexte}
            </span>
          ) : (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">Vote terminé</span>
          )}
        </div>
        <p className="mt-2 text-sm text-white/60">
          Le choix des supporters. L&apos;homme du match officiel est décidé par l&apos;organisation.
        </p>

        {/* ---------- Résultats ---------- */}
        {afficherResultats && (
          <div className="mt-6">
            {total === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm text-white/55">
                Aucun vote pour l&apos;instant.
              </p>
            ) : (
              <>
                {!ouvert && gagnant && (
                  <div className="mb-5 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-transparent p-4 ring-1 ring-yellow-400/40">
                    <Crown className="shrink-0 text-yellow-300" size={28} />
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-yellow-300/90">Choix des supporters</p>
                      <p className="truncate font-display text-2xl font-bold uppercase">{gagnant.nom}</p>
                      <p className="text-xs text-white/60">
                        {gagnant.votes} vote{gagnant.votes > 1 ? "s" : ""} sur {total}
                        {officiel &&
                          (officiel.id === gagnant.id
                            ? " — le même choix que l'homme du match officiel !"
                            : ` — l'homme du match officiel est ${officiel.nom}`)}
                      </p>
                    </div>
                  </div>
                )}
                <ol className="space-y-2.5">
                  {classement.slice(0, 5).map((j, i) => {
                    const pct = Math.round((j.votes / total) * 100);
                    return (
                      <li key={j.id}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">{i + 1}</span>
                            <span className={`truncate ${i === 0 ? "font-bold" : "font-medium"}`}>{j.nom}</span>
                            {j.id === monVote && <span className="shrink-0 text-[11px] text-yellow-300">(ton vote)</span>}
                          </span>
                          <span className="shrink-0 font-semibold">{pct} %</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className={`h-full rounded-full transition-[width] duration-1000 ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-500" : "bg-gradient-to-r from-blue-500 to-blue-700"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-3 text-xs text-white/45">{total} vote{total > 1 ? "s" : ""} au total</p>
              </>
            )}
          </div>
        )}

        {/* ---------- Vote ---------- */}
        {ouvert && (
          <div className="mt-6">
            {!pret ? (
              <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ) : !identite ? (
              <PseudoForm description="Pas besoin de compte : choisis un pseudo pour voter, c'est le même que pour les pronostics." />
            ) : (
              <>
                <p className="mb-3 text-sm font-semibold">
                  {monVote ? "Tu peux changer ton vote jusqu'à la fin :" : "Qui a été le meilleur ?"}
                </p>
                <div className="flex flex-col gap-5">
                  {[home, away].map((team) => {
                    const equipe = joueurs.filter((j) => j.teamId === team.id);
                    if (equipe.length === 0) return null;
                    return (
                      <div key={team.id}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">{team.name}</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {equipe.map((j) => (
                            <button
                              key={j.id}
                              type="button"
                              onClick={() => setChoix(j.id)}
                              aria-pressed={choix === j.id}
                              className={`flex min-h-14 items-center gap-2.5 rounded-2xl border p-2 text-left transition active:scale-95 ${
                                choix === j.id
                                  ? "border-yellow-400 bg-yellow-400 text-amber-950 shadow-lg shadow-yellow-500/30"
                                  : "border-white/15 bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              {j.photoUrl ? (
                                <Image src={j.photoUrl} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                              ) : (
                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${choix === j.id ? "bg-amber-950/15" : "bg-white/10"}`}>
                                  {j.numero}
                                </span>
                              )}
                              <span className="min-w-0 truncate text-sm font-semibold">{j.nom}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={voter}
                  disabled={!choix || occupe || choix === monVote}
                  className="btn-sheen mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 font-bold text-white shadow-lg disabled:opacity-40"
                >
                  <Check size={18} /> {monVote ? "Changer mon vote" : "Valider mon vote"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ---------- Détail du match : révélé après le vote ---------- */}
        {afficherResultats ? (
          <div className="mt-8 border-t border-white/10 pt-6 text-foreground">{children}</div>
        ) : (
          children && (
            <p className="mt-6 rounded-2xl border border-dashed border-white/15 p-4 text-center text-sm text-white/60">
              Vote pour découvrir le détail du match : buteurs, passeurs, sanctions et compositions.
            </p>
          )
        )}
      </div>
    </section>
  );
}
