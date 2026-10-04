'use client';

// Hero "sport landing page" : panneau sombre + photo, rubans diagonaux décoratifs.
// Inspiré de la structure classique panneau/photo des landing pages sportives
// (pas une reproduction du visuel Freepik fourni) — recréé avec la charte
// TALLY CARREAUX (couleurs pitch/carreaux, police Oswald, mode clair/sombre).
//
// Utilisation :
// <SportHero
//   imageSrc="/images/hero-match.jpg"
//   imageAlt="Joueur du championnat TALLY CARREAUX en action"
// />

import Image from 'next/image';
import styles from './sport-hero.module.css';

interface SportHeroProps {
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  paragraph?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Chemin de l'image (à fournir — aucune image par défaut n'est incluse) */
  imageSrc: string;
  imageAlt: string;
  className?: string;
}

export function SportHero({
  eyebrow = 'Championnat Tally Carreaux',
  titleLine1 = 'Fais partie',
  titleLine2 = 'du jeu',
  subtitle = 'Saison 2026',
  paragraph = "Historique des matchs, statistiques des joueurs et des équipes, classements en temps réel : tout le championnat, au même endroit.",
  ctaLabel = 'Voir le championnat',
  ctaHref = '/matchs',
  imageSrc,
  imageAlt,
  className = '',
}: SportHeroProps) {
  return (
    <section
      className={`${styles.hero} ${className} grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-pitch-950 text-carreaux-chalk shadow-lg`}
    >
      {/* --- Panneau de texte --- */}
      <div className="relative z-10 flex flex-col justify-center gap-4 px-7 py-10 sm:px-10 sm:py-14">
        <span className={`${styles.eyebrow} text-xs font-semibold uppercase tracking-[3px] text-carreaux-accent`}>
          {eyebrow}
        </span>

        <h1 className={`${styles.titre} font-display uppercase italic leading-[0.95] text-4xl sm:text-5xl`}>
          {titleLine1}
          <br />
          {titleLine2}
        </h1>

        <p className={`${styles.sousTitre} font-display uppercase tracking-wide text-sm text-carreaux-chalk/70`}>
          {subtitle}
        </p>

        <p className={`${styles.paragraphe} max-w-sm text-sm leading-relaxed text-carreaux-chalk/60`}>
          {paragraph}
        </p>

        <a
          href={ctaHref}
          className={`${styles.cta} mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-pitch-500 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-pitch-400`}
        >
          {ctaLabel}
        </a>
      </div>

      {/* --- Photo + rubans décoratifs --- */}
      <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-top"
          priority
        />

        {/* halos lumineux discrets */}
        <div className={`${styles.halo} -left-10 top-1/4 h-40 w-40 bg-pitch-400`} />
        <div className={`${styles.halo} -right-6 bottom-10 h-32 w-32 bg-carreaux-accent`} />

        {/* rubans diagonaux sur la jonction panneau / photo — desktop uniquement */}
        <div className="pointer-events-none absolute inset-y-0 -left-6 hidden w-24 lg:block">
          <div
            className={`${styles.ruban} ${styles.rubanA} left-10 top-[8%] h-[40%] w-7 rotate-[14deg] bg-gradient-to-b from-pitch-400 to-pitch-600`}
          />
          <div
            className={`${styles.ruban} ${styles.rubanB} left-2 top-[45%] h-[30%] w-5 rotate-[14deg] bg-carreaux-accent`}
          />
          <div
            className={`${styles.ruban} ${styles.rubanC} left-16 bottom-[6%] h-[22%] w-4 rotate-[14deg] bg-gradient-to-b from-pitch-500 to-pitch-700`}
          />
          <div
            className={`${styles.ligne} left-6 top-[10%] h-[80%] w-0 rotate-[14deg] border-l-2 border-dashed border-carreaux-chalk/70`}
          />
        </div>

        {/* version mobile simplifiée : simple liseré en haut de la photo */}
        <div
          className={`${styles.ruban} ${styles.rubanA} left-6 top-3 h-2 w-16 rounded-full bg-carreaux-accent lg:hidden`}
        />
      </div>
    </section>
  );
}
