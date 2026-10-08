// Bandeau défilant : les valeurs du championnat (tirées de l'écusson officiel).
const MOTS = ["Respect", "Équité", "Passion", "Fair Play", "Le jeu nous rassemble", "Le fair play nous grandit"];

function Bloc({ cache }: { cache?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={cache}>
      {[...MOTS, ...MOTS].map((mot, i) => (
        <span key={i} className="flex items-center gap-8">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-yellow-400/90 sm:text-base">
            {mot}
          </span>
          <span className="text-yellow-500/70">★</span>
        </span>
      ))}
    </div>
  );
}

export function BrandMarquee() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#0a1440] py-3.5"
      aria-label="Respect, équité, passion, fair play"
    >
      <div className="animate-marquee flex w-max">
        <Bloc />
        <Bloc cache />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a1440] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a1440] to-transparent" />
    </div>
  );
}
