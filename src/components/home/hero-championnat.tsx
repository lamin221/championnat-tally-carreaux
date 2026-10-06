import Image from 'next/image';
import { Trophy, ArrowRight, Users, CalendarDays, BarChart3, Swords } from 'lucide-react';

// Hero de la page d'accueil — fond marine, formes courbes diagonales,
// grande photo à droite, bandeau de raccourcis en bas.
// Composant autonome : aucune classe/couleur personnalisée externe requise,
// uniquement des couleurs Tailwind directes. Ne touche pas à la navbar existante.

interface HeroChampionnatProps {
  /** Photo d'action fournie par toi — aucune image par défaut incluse */
  imageSrc: string;
  imageAlt: string;
  ctaHref?: string;
  ctaLabel?: string;
}

const RACCOURCIS = [
  { icone: Swords, titre: 'Confrontations', sousTitre: 'Tally vs Café Gui', href: '/confrontations' },
  { icone: CalendarDays, titre: 'Matchs', sousTitre: 'Calendrier & résultats', href: '/matchs' },
  { icone: BarChart3, titre: 'Classement', sousTitre: 'Tableau en direct', href: '/classements' },
  { icone: Users, titre: 'Joueurs', sousTitre: 'Statistiques & profils', href: '/joueurs' },
];

export function HeroChampionnat({
  imageSrc,
  imageAlt,
  ctaHref = '/matchs',
  ctaLabel = 'Voir le championnat',
}: HeroChampionnatProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f]">
      {/* --- formes courbes décoratives --- */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M900,-50 C1050,150 750,350 1000,500 C1250,650 1150,850 950,950 L1700,950 L1700,-50 Z"
          fill="url(#gradBleu)"
          opacity="0.5"
        />
        <path
          d="M980,-50 C1120,160 840,360 1080,510 C1300,660 1200,860 1000,950 L1700,950 L1700,-50 Z"
          fill="none"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <defs>
          <linearGradient id="gradBleu" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d6fe0" />
            <stop offset="100%" stopColor="#0a1440" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-6 lg:py-24">
        {/* --- colonne texte --- */}
        <div className="flex flex-col justify-center gap-5">
          <span className="text-xs font-medium italic tracking-[3px] text-blue-300/80">
            LE FOOTBALL, UNE PASSION, UN SEUL CHAMPIONNAT
          </span>

          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            <span className="block text-white">Championnat</span>
            <span className="block bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Tally Carreaux
            </span>
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-blue-100/70 sm:text-base">
            Suivez, vivez et partagez chaque instant du championnat Tally Carreaux.
            Tous les matchs, toutes les équipes, les résultats en un seul endroit.
          </p>

          <a
            href={ctaHref}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
          >
            <Trophy size={16} />
            {ctaLabel}
            <ArrowRight size={15} />
          </a>

          {/* --- bandeau de raccourcis --- */}
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-white/10 pt-6 sm:grid-cols-4 sm:divide-x sm:divide-white/10">
            {RACCOURCIS.map(({ icone: Icone, titre, sousTitre, href }) => (
              <a key={titre} href={href} className="flex flex-col items-center gap-1.5 text-center sm:px-2">
                <Icone size={22} className="text-blue-300" />
                <span className="text-sm font-semibold text-white">{titre}</span>
                <span className="text-[11px] text-blue-100/50">{sousTitre}</span>
              </a>
            ))}
          </div>
        </div>

        {/* --- colonne photo --- */}
           <div className="relative min-h-[220px] sm:min-h-[300px] lg:min-h-[360px]">
          <div className="absolute inset-4 overflow-hidden rounded-[32px]">
            <Image src={imageSrc} alt={imageAlt} fill className="object-cover" priority />
          </div>
        </div>
      </div>
    </section>
  );
}
