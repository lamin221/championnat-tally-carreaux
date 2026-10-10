import { ImageResponse } from "next/og";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { getMatchById, getTeams } from "@/lib/queries";
import {
  fetchImageDataUri,
  loadOgAssets,
  ogFonts,
  OG_SIZE,
  OG_CONTENT_TYPE,
  MatchShareCard,
  SiteShareCard,
} from "@/lib/og";

export const alt = "Match du championnat Tally Carreaux";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const STATUTS: Record<string, string> = {
  termine: "TERMINÉ",
  en_cours: "EN DIRECT",
  a_venir: "À VENIR",
  annule: "ANNULÉ",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { font, logo } = await loadOgAssets();
  const options = { ...size, fonts: ogFonts(font) };

  const [match, teams] = await Promise.all([getMatchById(id), getTeams()]);
  const home = match ? teams.find((t) => t.id === match.home_team_id) : undefined;
  const away = match ? teams.find((t) => t.id === match.away_team_id) : undefined;

  // Match introuvable : on retombe sur la carte générale du site.
  if (!match || !home || !away) {
    return new ImageResponse(<SiteShareCard logo={logo} />, options);
  }

  const [logoHome, logoAway] = await Promise.all([
    fetchImageDataUri(home.logo_url),
    fetchImageDataUri(away.logo_url),
  ]);

  const date = format(parseISO(match.match_date), "EEEE d MMMM yyyy", { locale: fr });
  const heure = (match.match_time ?? "").slice(0, 5);

  return new ImageResponse(
    (
      <MatchShareCard
        logo={logo}
        home={{ nom: home.name, couleur: home.primary_color, logo: logoHome }}
        away={{ nom: away.name, couleur: away.primary_color, logo: logoAway }}
        finished={match.status === "termine"}
        hs={Number(match.home_score ?? 0)}
        as={Number(match.away_score ?? 0)}
        statut={STATUTS[match.status] ?? ""}
        heure={heure}
        pied={`${date.charAt(0).toUpperCase()}${date.slice(1)} — ${match.venue}`}
      />
    ),
    options
  );
}
