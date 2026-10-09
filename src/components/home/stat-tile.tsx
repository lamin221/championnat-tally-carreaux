import type { LucideIcon } from "lucide-react";
import { CountUp } from "./count-up";

const TONES = {
  navy: "bg-gradient-to-br from-[#0a1440] to-[#060b1f] text-white border border-white/10",
  gold: "bg-gradient-to-br from-yellow-500 to-amber-700 text-white",
  red: "bg-gradient-to-br from-red-600 to-red-800 text-white",
  blue: "bg-gradient-to-br from-blue-600 to-blue-900 text-white",
} as const;

/** Tuile de statistique : chiffre animé, icône en filigrane, léger soulèvement au survol. */
export function StatTile({
  label,
  value,
  icon: Icon,
  tone,
  decimals = 0,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  decimals?: number;
}) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:p-6 ${TONES[tone]}`}
    >
      <Icon
        size={92}
        strokeWidth={1.2}
        aria-hidden
        className="absolute -bottom-4 -right-3 opacity-[0.12] transition duration-500 group-hover:-rotate-6 group-hover:scale-110"
      />
      <div className="relative">
        <div className="score-numeral text-4xl leading-none sm:text-5xl">
          <CountUp value={value} decimals={decimals} />
        </div>
        <p className="mt-2 text-xs font-medium text-white/80 sm:text-sm">{label}</p>
      </div>
    </div>
  );
}
