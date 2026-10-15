// Règles du vote du public pour l'homme du match (serveur et navigateur).

/** Durée du vote après le coup d'envoi. À garder identique à « 72 hours » dans la migration 0006. */
export const FENETRE_VOTE_HEURES = 72;

export interface CompteVote {
  match_id: string;
  player_id: string;
  votes: number;
}

export interface MonVote {
  match_id: string;
  player_id: string;
}

/** Instant (ms) où le vote se ferme : coup d'envoi + 72 h, heure UTC+0 (Sénégal). */
export function limiteVote(m: { match_date: string; match_time: string | null }): number {
  const heure = (m.match_time ?? "00:00").slice(0, 5);
  return new Date(`${m.match_date}T${heure}:00Z`).getTime() + FENETRE_VOTE_HEURES * 3600 * 1000;
}

/** Le vote est ouvert pour un match terminé, pendant 72 h. */
export function voteOuvert(
  m: { status: string; match_date: string; match_time: string | null },
  maintenant: number = Date.now()
) {
  return m.status === "termine" && maintenant < limiteVote(m);
}

export function messageErreurVote(erreur: string): string {
  if (erreur.includes("vote_ferme")) return "Le vote est terminé pour ce match.";
  if (erreur.includes("match_non_termine")) return "Le vote ouvre quand le match est terminé.";
  if (erreur.includes("joueur_non_eligible")) return "Ce joueur n'a pas participé à ce match.";
  if (erreur.includes("predicteur_inconnu")) return "Ton profil n'existe plus, choisis un pseudo à nouveau.";
  return "Une erreur est survenue, réessaie.";
}
