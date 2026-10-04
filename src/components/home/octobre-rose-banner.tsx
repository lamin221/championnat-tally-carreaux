'use client';

// Bannière de sensibilisation Octobre Rose.
// Design original (ruban + cœur en SVG), pensé pour s'intégrer à la charte
// "tableau d'affichage de stade" du site (police Oswald, cartes à fort contraste).
//
// Utilisation : <OctobreRoseBanner /> en haut de app/page.tsx, au-dessus du hero existant.

import { useState } from 'react';
import styles from './octobre-rose-banner.module.css';

interface OctobreRoseBannerProps {
  /** Lien du bouton d'appel à l'action */
  href?: string;
  /** Classes additionnelles pour ajuster le placement dans la page */
  className?: string;
}

export function OctobreRoseBanner({
  href = '#',
  className = '',
}: OctobreRoseBannerProps) {
  // Incrémenter la clé force React à remonter le bloc animé, ce qui relance les keyframes CSS.
  const [rejeuId, setRejeuId] = useState(0);

  return (
    <section
      className={`${styles.banniere} ${className} rounded-2xl border border-pitch-900/10 dark:border-carreaux-chalk/10 bg-gradient-to-br from-[#ffe3ee] via-[#fbb3cf] to-[#ec5c96] dark:from-[#2a0f1c] dark:via-[#3a1326] dark:to-[#5c1b3a] px-6 py-12 sm:px-10 sm:py-14 text-center shadow-sm`}
      onClick={() => setRejeuId((id) => id + 1)}
      title="Cliquer pour rejouer l'animation"
    >
      <span className={`${styles.rejouer} text-[11px] tracking-wide text-pitch-900/60 dark:text-carreaux-chalk/60`}>
        ↻ rejouer
      </span>

      <div key={rejeuId}>
        <div className={styles.particules} aria-hidden="true">
          <span className={`${styles.particule} ${styles.p1} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
          <span className={`${styles.particule} ${styles.p2} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
          <span className={`${styles.particule} ${styles.p3} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
          <span className={`${styles.particule} ${styles.p4} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
          <span className={`${styles.particule} ${styles.p5} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
          <span className={`${styles.particule} ${styles.p6} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
          <span className={`${styles.particule} ${styles.p7} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
          <span className={`${styles.particule} ${styles.p8} text-[#c23574] dark:text-[#f481b4]`}>♥</span>
        </div>

        <div className={styles.scene}>
          <svg className={styles.ruban} viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradRuban" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f481b4" />
                <stop offset="100%" stopColor="#c23574" />
              </linearGradient>
              <linearGradient id="gradRubanClaire" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbd2e4" />
                <stop offset="100%" stopColor="#ec5c96" />
              </linearGradient>
            </defs>

            {/* pan gauche */}
            <g className={styles.panGauche}>
              <path
                d="M100,92 C78,108 48,138 34,176 C30,187 32,196 40,200 C50,205 60,200 66,190
                   C78,166 92,132 104,100 Z"
                fill="url(#gradRuban)"
                stroke="#ffffff"
                strokeWidth={2}
                strokeOpacity={0.5}
              />
            </g>

            {/* pan droit */}
            <g className={styles.panDroit}>
              <path
                d="M100,92 C122,108 152,138 166,176 C170,187 168,196 160,200 C150,205 140,200 134,190
                   C122,166 108,132 96,100 Z"
                fill="url(#gradRubanClaire)"
                stroke="#ffffff"
                strokeWidth={2}
                strokeOpacity={0.5}
              />
            </g>

            {/* boucle du haut */}
            <g className={styles.boucle}>
              <path
                d="M100,100
                   C78,100 58,86 58,62
                   C58,38 78,24 100,40
                   C122,24 142,38 142,62
                   C142,86 122,100 100,100 Z"
                fill="url(#gradRuban)"
                stroke="#ffffff"
                strokeWidth={2.5}
                strokeOpacity={0.6}
              />
              <path
                d="M100,100 C92,88 88,70 100,56 C112,70 108,88 100,100 Z"
                fill="#ffffff"
                fillOpacity={0.25}
              />
            </g>
          </svg>

          <svg className={styles.coeur} viewBox="0 0 100 100" width="42" height="42">
            <path
              d="M50,88 C18,64 4,44 4,26 C4,10 16,2 28,2 C38,2 46,8 50,18
                 C54,8 62,2 72,2 C84,2 96,10 96,26 C96,44 82,64 50,88 Z"
              fill="#ffffff"
              stroke="#c23574"
              strokeWidth={3}
            />
          </svg>
        </div>

        <h2 className={`${styles.titre} font-display uppercase tracking-wide text-3xl sm:text-4xl text-pitch-950 dark:text-carreaux-chalk`}>
          Octobre <span className="text-[#c23574] dark:text-[#f481b4]">Rose</span>
        </h2>
        <p className={`${styles.sousTitre} mx-auto mt-2 max-w-md text-sm sm:text-base text-pitch-950/75 dark:text-carreaux-chalk/75`}>
          Le championnat TALLY CARREAUX se mobilise contre le cancer du sein.
          Ensemble, soutenons le dépistage précoce.
        </p>
        <a
          href={href}
          onClick={(e) => e.stopPropagation()}
          className={`${styles.cta} mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c23574] to-[#ec5c96] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-105 transition`}
        >
          En savoir plus →
        </a>
        <p className={`${styles.mention} mt-4 text-[11px] uppercase tracking-[2px] text-[#c23574] dark:text-[#f481b4]`}>
          Sensibilisation · Prévention · Soutien
        </p>
      </div>
    </section>
  );
}
