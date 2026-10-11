// Texte des notifications push. Fonction pure : facile à tester et à modifier.

export type PushType = "kickoff" | "goal" | "final";

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export function buildMessage(input: {
  type: PushType;
  matchId: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  scorer?: string | null;
  minute?: number | null;
  ownGoal?: boolean;
  motm?: string | null;
}): PushPayload {
  const { type, matchId, home, away, homeScore, awayScore } = input;
  const score = `${home} ${homeScore} - ${awayScore} ${away}`;
  const base = { url: `/matchs/${matchId}`, tag: `match-${matchId}` };

  if (type === "kickoff") {
    return { ...base, title: "🔴 Coup d'envoi !", body: `${home} vs ${away} — suivez le match en direct` };
  }

  if (type === "goal") {
    const minute = input.minute != null ? ` (${input.minute}')` : "";
    const qui = input.scorer ? ` ${input.scorer}` : "";
    return {
      ...base,
      title: input.ownGoal ? `⚽ But contre son camp !${minute}` : `⚽ BUT !${qui}${minute}`,
      body: score,
    };
  }

  const gagnant =
    homeScore === awayScore ? "Match nul" : `Victoire de ${homeScore > awayScore ? home : away}`;
  return {
    ...base,
    title: `🏁 Fin du match — ${gagnant}`,
    body: input.motm ? `${score} — Homme du match : ${input.motm}` : score,
  };
}
