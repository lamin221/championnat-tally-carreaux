"use client";

import { useState } from "react";
import { Check, Lock, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TeamBadge } from "@/components/ui/team-badge";
import { issueDuMatch, messageErreur, type Choix, type MonPronostic, type StatsPronostic } from "@/lib/pronostics";
import type { Match, Team } from "@/types/database";
import type { Identite } from "./use-predictor";

export interface ItemPronostic {
  match: Match;
  home: Team;
  away: Team;
  stats?: StatsPronostic;
}

function Compteur({ valeur, onChange, label }: { valeur: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="max-w-24 truncate text-[11px] text-white/55">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, valeur - 1))} aria-label="Moins un" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 active:scale-95">
          <Minus size={16} />
        </button>
        <span className="score-numeral w-8 text-center text-3xl">{valeur}</span>
        <button type="button" onClick={() => onChange(Math.min(30, valeur + 1))} aria-label="Plus un" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 active:scale-95">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

/** Carte de pronostic d'un match : choix 1 / N / 2, score exact facultatif, répartition du public. */
export function PredictionCard({
  item,
  identite,
  mine,
  onSaved,
  onUnknown,
}: {
  item: ItemPronostic;
  identite: Identite;
  mine?: MonPronostic;
  onSaved: (p: MonPronostic) => void;
  onUnknown: () => void;
}) {
  const { match, home, away, stats } = item;
  const [pick, setPick] = useState<Choix | null>(mine?.pick ?? null);
  const [avecScore, setAvecScore] = useState(mine?.home_goals != null);
  const [h, setH] = useState(mine?.home_goals ?? 1);
  const [a, setA] = useState(mine?.away_goals ?? 0);
  const [occupe, setOccupe] = useState(false);

  const dejaVote = Boolean(mine);

  function choisir(c: Choix) {
    setPick(c);
    if (avecScore) {
      // On garde le score cohérent avec le résultat choisi
      if (c === "home" && h <= a) { setH(a + 1); }
      if (c === "away" && a <= h) { setA(h + 1); }
      if (c === "draw" && h !== a) { setA(h); }
    }
  }

  function changerScore(nh: number, na: number) {
    setH(nh);
    setA(na);
    setPick(issueDuMatch(nh, na));
  }

  function activerScore(on: boolean) {
    setAvecScore(on);
    if (on && pick) {
      if (pick === "home") { setH(1); setA(0); }
      else if (pick === "away") { setH(0); setA(1); }
      else { setH(0); setA(0); }
    }
  }

  async function valider() {
    if (!pick) return;
    setOccupe(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_prediction", {
      p_predictor: identite.id,
      p_match: match.id,
      p_pick: pick,
      p_home: avecScore ? h : null,
      p_away: avecScore ? a : null,
    });
    setOccupe(false);
    if (error) {
      if (error.message.includes("predicteur_inconnu")) onUnknown();
      return toast.error(messageErreur(error.message));
    }
    toast.success("Pronostic enregistré !");
    onSaved({ match_id: match.id, pick, home_goals: avecScore ? h : null, away_goals: avecScore ? a : null });
  }

  const total = stats?.total ?? 0;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const choix: { id: Choix; label: string }[] = [
    { id: "home", label: home.name },
    { id: "draw", label: "Match nul" },
    { id: "away", label: away.name },
  ];

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-5 text-white shadow-xl shadow-blue-950/30 sm:p-7">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />

      <div className="flex items-center justify-between gap-3 text-xs text-white/55">
        <span className="capitalize">
          {new Date(`${match.match_date}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}
          {match.match_time ? ` — ${match.match_time.slice(0, 5)}` : ""}
        </span>
        {dejaVote && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-300">
            <Check size={12} /> Pronostic enregistré
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {[home, away].map((t, i) => (
          <div key={t.id} className={`flex min-w-0 flex-1 flex-col items-center gap-2 text-center ${i === 1 ? "order-3" : ""}`}>
            <div className="rounded-full bg-white/10 p-1 ring-2 ring-white/25">
              <TeamBadge team={t} size={52} showName={false} />
            </div>
            <span className="w-full truncate text-sm font-semibold">{t.name}</span>
          </div>
        ))}
        <span className="order-2 font-display text-xl text-white/35">VS</span>
      </div>

      <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300/90">Qui va gagner ?</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {choix.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => choisir(c.id)}
            aria-pressed={pick === c.id}
            className={`min-h-14 rounded-2xl border px-2 py-2 text-center text-sm font-semibold transition active:scale-95 ${
              pick === c.id
                ? "border-yellow-400 bg-yellow-400 text-amber-950 shadow-lg shadow-yellow-500/30"
                : "border-white/15 bg-white/5 hover:bg-white/10"
            }`}
          >
            <span className="line-clamp-2 leading-tight">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Score exact */}
      <div className="mt-4">
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl bg-white/5 px-4 text-sm">
          <span>
            Deviner le score exact <span className="text-yellow-300">(+2 pts)</span>
          </span>
          <input type="checkbox" className="h-5 w-5" checked={avecScore} onChange={(e) => activerScore(e.target.checked)} disabled={!pick} />
        </label>
        {avecScore && pick && (
          <div className="mt-4 flex items-center justify-center gap-6">
            <Compteur valeur={h} onChange={(n) => changerScore(n, a)} label={home.name} />
            <span className="mt-5 text-white/30">–</span>
            <Compteur valeur={a} onChange={(n) => changerScore(h, n)} label={away.name} />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={valider}
        disabled={!pick || occupe}
        className="btn-sheen mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 font-bold text-white shadow-lg disabled:opacity-40"
      >
        <Check size={18} /> {dejaVote ? "Modifier mon pronostic" : "Valider mon pronostic"}
      </button>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-white/45">
        <Lock size={11} /> Modifiable jusqu&apos;au coup d&apos;envoi
      </p>

      {/* Répartition du public : visible une fois qu'on a voté, pour ne pas influencer son choix */}
      {dejaVote && total > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-2 text-center text-[11px] uppercase tracking-widest text-white/50">
            Les pronostics des supporters ({total})
          </p>
          <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="bg-red-500" style={{ flexGrow: stats?.home_count ?? 0 }} />
            <div className="bg-yellow-400" style={{ flexGrow: stats?.draw_count ?? 0 }} />
            <div className="bg-blue-500" style={{ flexGrow: stats?.away_count ?? 0 }} />
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-red-300">{pct(stats?.home_count ?? 0)} % {home.name}</span>
            <span className="text-yellow-300">{pct(stats?.draw_count ?? 0)} % nul</span>
            <span className="text-blue-300">{pct(stats?.away_count ?? 0)} % {away.name}</span>
          </div>
        </div>
      )}
    </article>
  );
}
