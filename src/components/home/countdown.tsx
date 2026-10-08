"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Compte à rebours jusqu'au coup d'envoi. `target` = date ISO complète (UTC). */
export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? null : new Date(target).getTime() - now;

  if (diff !== null && diff <= 0) {
    return (
      <p className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-center text-sm font-semibold text-yellow-300">
        Le coup d&apos;envoi est donné !
      </p>
    );
  }

  const total = diff === null ? 0 : Math.floor(diff / 1000);
  const tuiles = [
    { label: "Jours", value: Math.floor(total / 86400) },
    { label: "Heures", value: Math.floor((total % 86400) / 3600) },
    { label: "Min", value: Math.floor((total % 3600) / 60) },
    { label: "Sec", value: total % 60 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label="Temps restant avant le match">
      {tuiles.map((t) => (
        <div
          key={t.label}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-1 py-3 text-center backdrop-blur-sm"
        >
          <div
            key={diff === null ? "x" : t.value}
            className="score-numeral animate-tick text-3xl text-white sm:text-4xl"
          >
            {diff === null ? "--" : pad(t.value)}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-white/50">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
