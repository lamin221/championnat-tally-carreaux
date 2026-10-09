import type { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/home/count-up";
import { delay } from "@/lib/anim";

/** Bandeau d'en-tête commun à toutes les pages : fond marine animé, titre avec reflet. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] px-6 py-9 text-white shadow-xl shadow-blue-950/30 sm:px-10 sm:py-12">
      <div aria-hidden className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl animate-orb" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-red-600/15 blur-3xl animate-orb [animation-delay:-6s]" />
      <div aria-hidden className="pointer-events-none absolute right-8 top-6 h-32 w-32 rounded-full bg-yellow-400/10 blur-3xl animate-orb [animation-delay:-3s]" />
      <div aria-hidden className="bg-carreaux-grid pointer-events-none absolute inset-0" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <span
            className="hero-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-blue-200/90 backdrop-blur"
            style={delay(0)}
          >
            <span className="pulse-dot h-2 w-2 rounded-full bg-yellow-400" />
            {eyebrow ?? "Championnat Tally Carreaux"}
          </span>

          <h1
            className="hero-in mt-4 flex items-center gap-3 text-4xl font-bold uppercase leading-[1] tracking-tight sm:text-6xl"
            style={delay(120)}
          >
            {Icon && (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-yellow-300 ring-1 ring-white/15 sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
            )}
            <span className="text-shine bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <span className="animate-grow-x mt-4 block h-1 w-24 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-600" />

          {subtitle && (
            <p className="hero-in mt-4 max-w-xl text-sm text-blue-100/70 sm:text-base" style={delay(300)}>
              {subtitle}
            </p>
          )}
        </div>

        {children && (
          <div className="hero-in flex flex-wrap gap-3" style={delay(380)}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

/** Pastille chiffrée affichée à droite du bandeau. */
export function HeaderChip({ label, value, gold = false }: { label: string; value: number; gold?: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-5 py-3 text-center backdrop-blur ${
        gold ? "border-yellow-400/40 bg-yellow-400/10" : "border-white/15 bg-white/5"
      }`}
    >
      <div className={`score-numeral text-3xl leading-none ${gold ? "text-yellow-300" : "text-white"}`}>
        <CountUp value={value} />
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-widest text-white/55">{label}</div>
    </div>
  );
}
