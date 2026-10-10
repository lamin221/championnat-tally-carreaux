import { CalendarDays } from "lucide-react";
import { getMatches, getTeams } from "@/lib/queries";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";
import { MatchesBrowser } from "@/components/ui/matches-browser";
import { LiveRefresher } from "@/components/live/live-refresher";

export const metadata = { title: "Historique des matchs — Tally Carreaux" };

export default async function MatchsPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()]);
  const joues = matches.filter((m) => m.status === "termine").length;
  const aVenir = matches.filter((m) => m.status === "a_venir").length;
  const enCours = matches.some((m) => m.status === "en_cours");

  return (
    <div className="flex flex-col gap-8">
      <LiveRefresher sondage={enCours} />
      <PageHeader
        icon={CalendarDays}
        title="Matchs"
        subtitle="Tout l'historique du championnat : résultats, buteurs, sanctions et compositions."
      >
        <HeaderChip label="Joués" value={joues} />
        <HeaderChip label="À venir" value={aVenir} gold />
      </PageHeader>

      {matches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Aucun match enregistré pour le moment.
        </p>
      ) : (
        <MatchesBrowser matches={matches} teams={teams} />
      )}
    </div>
  );
}

export const revalidate = 0;
