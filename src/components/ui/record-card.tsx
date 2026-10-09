import type { LucideIcon } from "lucide-react";

/** Plaque de record : grand chiffre doré sur fond marine, icône en filigrane. */
export function RecordCard({
  icon: Icon,
  title,
  big,
  unit,
  caption,
  featured = false,
}: {
  icon: LucideIcon;
  title: string;
  big: React.ReactNode;
  unit?: string;
  caption?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-1.5 hover:border-yellow-400/40 hover:shadow-2xl sm:p-8 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl transition duration-500 group-hover:scale-150" />
      <Icon
        size={featured ? 150 : 110}
        strokeWidth={1}
        aria-hidden
        className="absolute -bottom-6 -right-4 text-white/[0.06] transition duration-500 group-hover:-rotate-6 group-hover:text-yellow-300/15"
      />

      <div className="relative flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-yellow-300">
          <Icon size={13} />
          Record
        </span>
        <p className="max-w-md text-sm text-white/65">{title}</p>
        <p className={`score-numeral flex items-baseline gap-3 leading-none text-yellow-300 ${featured ? "text-7xl sm:text-8xl" : "text-6xl"}`}>
          {big}
          {unit && <span className="font-body text-base font-medium text-white/60">{unit}</span>}
        </p>
        {caption && <p className="text-sm font-semibold text-white">{caption}</p>}
      </div>
    </article>
  );
}
