import type { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/home/count-up";
import { delay } from "@/lib/anim";

const MEDAILLES = [
  "from-yellow-300 to-yellow-600 text-amber-950 shadow-yellow-500/40",
  "from-slate-200 to-slate-400 text-slate-800 shadow-slate-400/40",
  "from-orange-300 to-amber-700 text-orange-950 shadow-amber-700/40",
];

/**
 * Classement d'une statistique : podium (médailles or/argent/bronze) et barres
 * proportionnelles au meilleur score. À placer dans un <Reveal> pour déclencher les barres.
 */
export function RankingCard({
  title,
  icon: Icon,
  players,
  metric,
}: {
  title: string;
  icon: LucideIcon;
  players: { name: string; value: number }[];
  metric: string;
}) {
  const top = players.slice(0, 5);
  const max = Math.max(1, ...top.map((p) => p.value));

  return (
    <section className="card relative h-full overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-transparent" />
      <h2 className="mb-5 flex items-center gap-2.5 font-display text-base font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0a1440] to-[#060b1f] text-yellow-300">
          <Icon size={18} />
        </span>
        {title}
      </h2>

      {top.length === 0 || max === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune donnée.</p>
      ) : (
        <ol className="space-y-3.5">
          {top.map((p, i) => (
            <li key={p.name}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      i < 3 ? `bg-gradient-to-br shadow-md ${MEDAILLES[i]}` : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`truncate text-sm ${i === 0 ? "font-bold" : "font-medium"}`}>{p.name}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="score-numeral text-xl">
                    <CountUp value={p.value} />
                  </span>
                  <span className="ml-1 text-[11px] text-muted-foreground">{metric}</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`bar-grow h-full origin-left rounded-full ${
                    i === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-600" : "bg-gradient-to-r from-blue-500 to-blue-700"
                  }`}
                  style={{ width: `${(p.value / max) * 100}%`, ...delay(150 + i * 120) }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
