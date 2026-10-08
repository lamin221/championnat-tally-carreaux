import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  Users,
  CalendarDays,
  BarChart3,
  Swords,
  MapPin,
} from "lucide-react";
import { CountUp } from "./count-up";
import { delay } from "@/lib/anim";

// Hero de la page d'accueil : fond marine animé (orbes lumineux, grille "carreaux"),
// titre avec reflet, photo flottante cerclée, pastilles de stats et raccourcis.

interface HeroChampionnatProps {
  imageSrc: string;
  imageAlt: string;
  /** Chiffres réels affichés en pastilles sur la photo */
  totalMatches?: number;
  totalGoals?: number;
}

const RACCOURCIS = [
  { icone: Swords, titre: "Confrontations", sousTitre: "Face-à-face", href: "/confrontations" },
  { icone: CalendarDays, titre: "Matchs", sousTitre: "Calendrier & résultats", href: "/matchs" },
  { icone: BarChart3, titre: "Classement", sousTitre: "Tableau en direct", href: "/classements" },
  { icone: Users, titre: "Joueurs", sousTitre: "Stats & profils", href: "/joueurs" },
];

export function HeroChampionnat({
  imageSrc,
  imageAlt,
  totalMatches,
  totalGoals,
}: HeroChampionnatProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] shadow-2xl shadow-blue-950/40">
      {/* Décor : orbes lumineux, grille, courbes */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl animate-orb" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-red-600/20 blur-3xl animate-orb [animation-delay:-7s]" />
      <div aria-hidden className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl animate-orb [animation-delay:-3s]" />
      <div aria-hidden className="bg-carreaux-grid pointer-events-none absolute inset-0" />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gradBleu" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d6fe0" />
            <stop offset="100%" stopColor="#0a1440" />
          </linearGradient>
        </defs>
        <path
          d="M900,-50 C1050,150 750,350 1000,500 C1250,650 1150,850 950,950 L1700,950 L1700,-50 Z"
          fill="url(#gradBleu)"
          opacity="0.45"
        />
        <path
          d="M980,-50 C1120,160 840,360 1080,510 C1300,660 1200,860 1000,950 L1700,950 L1700,-50 Z"
          fill="none"
          stroke="white"
          strokeOpacity="0.22"
          strokeWidth="3"
        />
      </svg>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-12 sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:py-20">
        {/* ---------- Colonne texte ---------- */}
        <div className="flex flex-col gap-6">
          <span
            className="hero-in inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-blue-200/90 backdrop-blur"
            style={delay(100)}
          >
            <span className="pulse-dot h-2 w-2 rounded-full bg-yellow-400" />
            Le football, une passion, un seul championnat
          </span>

          <div className="hero-in" style={delay(250)}>
            <h1 className="text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl">
              <span className="block text-white">Championnat</span>
              <span className="text-shine block bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent">
                Tally Carreaux
              </span>
            </h1>
            <span className="animate-grow-x mt-4 block h-1 w-28 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-600" />
          </div>

          <p
            className="hero-in max-w-md text-sm leading-relaxed text-blue-100/75 sm:text-base"
            style={delay(400)}
          >
            Suivez, vivez et partagez chaque instant du championnat. Tous les matchs,
            toutes les statistiques et les résultats, en un seul endroit.
          </p>

          <div className="hero-in flex flex-wrap items-center gap-3" style={delay(520)}>
            <Link
              href="/matchs"
              className="btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50"
            >
              <Trophy size={16} />
              Voir le championnat
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/classements"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-yellow-400/60 hover:bg-white/10"
            >
              Classement
            </Link>
          </div>

          <div
            className="hero-in mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4"
            style={delay(660)}
          >
            {RACCOURCIS.map(({ icone: Icone, titre, sousTitre, href }) => (
              <Link
                key={titre}
                href={href}
                className="group flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3.5 text-center transition duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:bg-white/10"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-500/15 text-blue-300 transition group-hover:scale-110 group-hover:bg-blue-500/30">
                  <Icone size={18} />
                </span>
                <span className="text-sm font-semibold text-white">{titre}</span>
                <span className="text-[11px] text-blue-100/50">{sousTitre}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ---------- Colonne photo ---------- */}
        <div className="hero-in relative mx-auto w-full max-w-xl lg:max-w-none" style={delay(350)}>
          <div className="animate-float">
            <div className="rounded-[34px] bg-gradient-to-br from-yellow-300 via-blue-500 to-red-500 p-[3px] shadow-2xl shadow-blue-900/60">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[31px] bg-[#0a1440] sm:aspect-[5/4] lg:aspect-auto lg:h-[480px]">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="animate-kenburns object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060b1f]/75 via-transparent to-[#060b1f]/10" />
              </div>
            </div>
          </div>

          {/* Pastilles flottantes */}
          <div className="animate-float absolute left-3 top-3 [animation-delay:-2s] sm:-left-3 sm:top-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md">
              <MapPin size={13} className="text-yellow-300" />
              Terrain Diéxal
            </span>
          </div>

          {typeof totalMatches === "number" && typeof totalGoals === "number" && (
            <div className="animate-float absolute bottom-3 right-3 flex gap-2 [animation-delay:-4s] sm:-bottom-4 sm:right-4">
              <div className="rounded-2xl border border-white/25 bg-[#0a1440]/80 px-4 py-2.5 text-center shadow-xl backdrop-blur-md">
                <div className="score-numeral text-2xl leading-none text-white">
                  <CountUp value={totalMatches} />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-blue-200/70">Matchs</div>
              </div>
              <div className="rounded-2xl border border-yellow-400/40 bg-[#0a1440]/80 px-4 py-2.5 text-center shadow-xl backdrop-blur-md">
                <div className="score-numeral text-2xl leading-none text-yellow-300">
                  <CountUp value={totalGoals} />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-yellow-200/70">Buts</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
