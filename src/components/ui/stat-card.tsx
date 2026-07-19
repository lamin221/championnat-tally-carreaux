import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "default" | "tally" | "carreaux";
}) {
  const accentClass =
    accent === "tally"
      ? "stat-gradient-tally text-white"
      : accent === "carreaux"
      ? "stat-gradient-carreaux text-white"
      : "card";

  return (
    <div className={`${accentClass} rounded-2xl p-5 flex items-center justify-between animate-fade-in`}>
      <div>
        <p className={accent === "default" ? "text-sm text-foreground/60" : "text-sm text-white/80"}>
          {label}
        </p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <Icon size={28} className={accent === "default" ? "text-foreground/40" : "text-white/70"} />
    </div>
  );
}
