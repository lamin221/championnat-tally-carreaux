"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ targetIso }: { targetIso: string }) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetIso);
    setTimeLeft(getTimeLeft(target));

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetIso]);

  // Évite le mismatch d'hydratation (le rendu serveur ne connaît pas "maintenant")
  if (!mounted) return null;

  if (!timeLeft) {
    return (
      <p className="text-center text-sm font-medium text-tally mt-3">
        Coup d&apos;envoi imminent !
      </p>
    );
  }

  const units = [
    { value: timeLeft.days, label: "jours" },
    { value: timeLeft.hours, label: "heures" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <div className="score-numeral text-xl sm:text-2xl bg-muted rounded-lg px-2.5 py-1.5 min-w-[2.75rem]">
            {String(u.value).padStart(2, "0")}
          </div>
          <p className="text-[10px] uppercase tracking-wide text-foreground/50 mt-1">{u.label}</p>
        </div>
      ))}
    </div>
  );
}
