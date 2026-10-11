"use client";

import { BellRing, Share } from "lucide-react";
import { usePush } from "./use-push";

/** Carte d'invitation sur l'accueil : « Ne rate aucun but ». Disparaît une fois activé. */
export function NotifyCard() {
  const { etat, occupe, activer } = usePush();
  if (etat !== "inactif" && etat !== "ios-installer") return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl shadow-blue-950/30 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-yellow-400/15 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 shadow-lg">
            <BellRing size={22} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">Ne rate aucun but</h2>
            {etat === "ios-installer" ? (
              <p className="mt-1 text-sm text-white/65">
                Sur iPhone, installe d&apos;abord l&apos;appli : touche{" "}
                <Share size={14} className="mx-0.5 inline -translate-y-px" /> Partager puis « Sur l&apos;écran
                d&apos;accueil », ouvre-la, et reviens activer les notifications.
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/65">
                Reçois une alerte au coup d&apos;envoi, à chaque but et au coup de sifflet final.
              </p>
            )}
          </div>
        </div>
        {etat === "inactif" && (
          <button
            onClick={activer}
            disabled={occupe}
            className="btn-sheen shrink-0 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 text-sm font-bold text-amber-950 shadow-lg shadow-yellow-500/30 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            Activer les notifications
          </button>
        )}
      </div>
    </section>
  );
}
