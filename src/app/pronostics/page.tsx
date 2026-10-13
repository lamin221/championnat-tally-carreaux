import { Target, Lock, Trophy } from "lucide-react";
import { getMatches, getTeams, getPredictionStats, getPredictionLeaderboard } from "@/lib/queries";
import { matchOuvert, POINTS_BONUS_SCORE, POINTS_RESULTAT } from "@/lib/pronostics";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";
import { Reveal } from "@/components/home/reveal";
import { PredictionPanel } from "@/components/pronostics/prediction-panel";
import { Leaderboard } from "@/components/pronostics/leaderboard";
import { MyResults } from "@/components/pronostics/my-results";

export const metadata = {
  title: "Pronostics — Tally Carreaux",
  description: "Devine le résultat des prochains matchs et grimpe au classement des pronostiqueurs.",
};

export default async function PronosticsPage() {
  const [teams, matches, stats, classement] = await Promise.all([
    getTeams(),
    getMatches(),
    getPredictionStats(),
    getPredictionLeaderboard(),
  ]);

  const maintenant = Date.now();
  const avecEquipes = (m: (typeof matches)[number]) => {
    const home = teams.find((t) => t.id === m.home_team_id);
    const away = teams.find((t) => t.id === m.away_team_id);
    return home && away ? { match: m, home, away } : null;
  };

  const ouverts = matches
    .filter((m) => matchOuvert(m, maintenant))
    .sort((a, b) => a.match_date.localeCompare(b.match_date))
    .map(avecEquipes)
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .map((x) => ({ ...x, stats: stats.find((s) => s.match_id === x.match.id) }));

  const fermes = matches.filter((m) => m.status === "en_cours" || (m.status === "a_venir" && !matchOuvert(m, maintenant)));

  const termines = matches
    .filter((m) => m.status === "termine")
    .slice(0, 15)
    .map(avecEquipes)
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader
        icon={Target}
        title="Pronostics"
        subtitle="Devine le résultat des prochains matchs, gagne des points et grimpe au classement."
      >
        <HeaderChip label="Matchs ouverts" value={ouverts.length} />
        <HeaderChip label="Pronostiqueurs" value={classement.length} gold />
      </PageHeader>

      {/* Règles */}
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: `${POINTS_RESULTAT} points`, d: "pour le bon résultat : victoire, nul ou défaite" },
            { t: `+${POINTS_BONUS_SCORE} points`, d: "de bonus si tu trouves le score exact (5 au total)" },
            { t: "Jusqu'au coup d'envoi", d: "tu peux changer ton pronostic tant que le match n'a pas commencé" },
          ].map((r) => (
            <div key={r.t} className="card p-4">
              <p className="font-display text-lg font-semibold text-yellow-600">{r.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Matchs ouverts */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">À pronostiquer</h2>
        {ouverts.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Aucun match ouvert aux pronostics pour le moment. Reviens avant le prochain coup d&apos;envoi !
          </p>
        ) : (
          <PredictionPanel items={ouverts} />
        )}
        {fermes.length > 0 && (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock size={13} /> {fermes.length} match{fermes.length > 1 ? "s" : ""} en cours ou sur le point de commencer : pronostics fermés.
          </p>
        )}
      </section>

      <Reveal>
        <Leaderboard rows={classement} />
      </Reveal>

      <MyResults matches={termines} />

      {classement.length === 0 && termines.length === 0 && (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Trophy size={13} /> Les points sont attribués automatiquement quand le résultat du match est publié.
        </p>
      )}
    </div>
  );
}

export const revalidate = 0;
