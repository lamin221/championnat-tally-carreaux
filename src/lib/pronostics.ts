// Règles et types communs aux pronostics (utilisables côté serveur et côté navigateur).

export type Choix = "home" | "draw" | "away";

export const POINTS_RESULTAT = 3; // bon résultat (victoire, nul, défaite)
export const POINTS_BONUS_SCORE = 2; // + bonus si le score exact est trouvé

export interface StatsPronostic {
  match_id: string;
  total: number;
  home_count: number;
  draw_count: number;
  away_count: number;
}

export interface LigneClassement {
  pseudo: string;
  played: number;
  correct: number;
  exact: number;
  points: number;
}

export interface MonPronostic {
  match_id: string;
  pick: Choix;
  home_goals: number | null;
  away_goals: number | null;
}

export function issueDuMatch(home: number, away: number): Choix {
  return home > away ? "home" : home < away ? "away" : "draw";
}

/** Points gagnés par un pronostic une fois le match terminé. */
export function pointsGagnes(p: MonPronostic, homeScore: number, awayScore: number) {
  if (p.pick !== issueDuMatch(homeScore, awayScore)) return 0;
  const exact = p.home_goals === homeScore && p.away_goals === awayScore;
  return POINTS_RESULTAT + (exact ? POINTS_BONUS_SCORE : 0);
}

/** Les pronostics sont ouverts tant que le match est « à venir » et que l'heure de début n'est pas passée (UTC+0, Sénégal). */
export function matchOuvert(
  m: { status: string; match_date: string; match_time: string | null },
  maintenant: number = Date.now()
) {
  if (m.status !== "a_venir") return false;
  const heure = (m.match_time ?? "23:59").slice(0, 5);
  return new Date(`${m.match_date}T${heure}:00Z`).getTime() > maintenant;
}

/** Traduit les erreurs renvoyées par la base en messages lisibles. */
export function messageErreur(erreur: string): string {
  if (erreur.includes("pseudo_pris")) return "Ce pseudo est déjà pris, essaie-en un autre.";
  if (erreur.includes("pseudo_invalide"))
    return "Pseudo invalide : 2 à 20 caractères (lettres, chiffres, espace, point, tiret, tiret bas).";
  if (erreur.includes("match_ferme")) return "Trop tard : ce match a déjà commencé.";
  if (erreur.includes("pronostic_incoherent")) return "Le score choisi ne correspond pas à ton résultat.";
  if (erreur.includes("pronostic_invalide")) return "Pronostic invalide.";
  if (erreur.includes("predicteur_inconnu")) return "Ton profil n'existe plus, choisis un pseudo à nouveau.";
  return "Une erreur est survenue, réessaie.";
}
