import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Briques communes aux images de partage (WhatsApp, Facebook, X...), générées par next/og.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const OR = "#f5d76e";

let cache: { font: Buffer; logo: string } | null = null;

/** Charge (une seule fois) la police Oswald Bold et le logo, depuis src/assets/og. */
export async function loadOgAssets() {
  if (cache) return cache;
  const [font, logo] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/og/Oswald-Bold.woff")),
    readFile(join(process.cwd(), "src/assets/og/logo.png")),
  ]);
  cache = { font, logo: `data:image/png;base64,${logo.toString("base64")}` };
  return cache;
}

export function ogFonts(font: Buffer) {
  const data = font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer;
  return [{ name: "Oswald", data, weight: 700 as const, style: "normal" as const }];
}

/** Télécharge un logo d'équipe et le convertit en data-URI (null si indisponible ou non pris en charge). */
export async function fetchImageDataUri(url: string | null | undefined): Promise<string | null> {
  if (!url || !url.startsWith("https://")) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/image\/(png|jpe?g|gif|svg\+xml)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function Crest({ nom, couleur, logo }: { nom: string; couleur: string; logo: string | null }) {
  const taille = 170;
  const ring = "6px solid rgba(255,255,255,0.35)";
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      width={taille}
      height={taille}
      style={{ borderRadius: taille / 2, border: ring, objectFit: "cover" }}
    />
  ) : (
    <div
      style={{
        width: taille,
        height: taille,
        borderRadius: taille / 2,
        border: ring,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 84,
        backgroundImage: `linear-gradient(135deg, ${couleur || "#1E40AF"}, #060b1f)`,
      }}
    >
      {nom.charAt(0).toUpperCase()}
    </div>
  );
}

export type OgTeam = { nom: string; couleur: string; logo: string | null };

/** Fond commun : dégradé marine, lueurs rouge/bleu, liseré doré en haut. */
function Fond({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "46px 64px 44px",
        color: "white",
        fontFamily: "Oswald",
        position: "relative",
        backgroundImage: "linear-gradient(135deg, #060b1f 0%, #0a1440 55%, #060b1f 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -140,
          top: 40,
          width: 560,
          height: 560,
          borderRadius: 280,
          backgroundImage: "radial-gradient(circle, rgba(220,38,38,0.30), rgba(220,38,38,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -140,
          top: 40,
          width: 560,
          height: 560,
          borderRadius: 280,
          backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.34), rgba(37,99,235,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 8,
          backgroundImage: `linear-gradient(90deg, #C9A227, ${OR}, #C9A227)`,
        }}
      />
      {children}
    </div>
  );
}

function Entete({ logo, droite }: { logo: string; droite?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={64} height={64} style={{ borderRadius: 32 }} />
        <div style={{ display: "flex", marginLeft: 18, fontSize: 30, letterSpacing: 4, color: OR }}>
          CHAMPIONNAT TALLY CARREAUX
        </div>
      </div>
      {droite && (
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 3,
            padding: "8px 22px",
            borderRadius: 30,
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          {droite}
        </div>
      )}
    </div>
  );
}

/** Carte de partage d'un match : équipes, score (ou VS), date, terrain. */
export function MatchShareCard({
  logo,
  home,
  away,
  finished,
  hs,
  as,
  statut,
  heure,
  pied,
}: {
  logo: string;
  home: OgTeam;
  away: OgTeam;
  finished: boolean;
  hs: number;
  as: number;
  statut: string;
  heure: string;
  pied: string;
}) {
  const colonne = (t: OgTeam) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 340 }}>
      <Crest nom={t.nom} couleur={t.couleur} logo={t.logo} />
      <div
        style={{
          display: "flex",
          marginTop: 22,
          fontSize: 42,
          textTransform: "uppercase",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {t.nom}
      </div>
    </div>
  );

  return (
    <Fond>
      <Entete logo={logo} droite={statut} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {colonne(home)}
        {finished ? (
          <div style={{ display: "flex", alignItems: "center", fontSize: 190, lineHeight: 1 }}>
            <div style={{ display: "flex", color: hs > as ? OR : "white" }}>{hs}</div>
            <div style={{ display: "flex", margin: "0 26px", color: "rgba(255,255,255,0.3)" }}>–</div>
            <div style={{ display: "flex", color: as > hs ? OR : "white" }}>{as}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 110, color: "rgba(255,255,255,0.4)" }}>VS</div>
            <div style={{ display: "flex", fontSize: 56, color: OR }}>{heure}</div>
          </div>
        )}
        {colonne(away)}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
          color: "rgba(255,255,255,0.78)",
        }}
      >
        <div style={{ display: "flex" }}>{pied}</div>
        <div style={{ display: "flex", color: OR, letterSpacing: 4 }}>RESPECT • ÉQUITÉ • PASSION</div>
      </div>
    </Fond>
  );
}

/** Carte de partage générale du site (accueil et pages sans image dédiée). */
export function SiteShareCard({ logo }: { logo: string }) {
  return (
    <Fond>
      <div style={{ display: "flex", height: 1 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={230} height={230} style={{ borderRadius: 115 }} />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 48 }}>
          <div style={{ display: "flex", fontSize: 60, letterSpacing: 4, lineHeight: 1 }}>CHAMPIONNAT</div>
          <div style={{ display: "flex", fontSize: 90, lineHeight: 1.05, color: OR }}>TALLY CARREAUX</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 28, letterSpacing: 6, color: "rgba(255,255,255,0.8)" }}>
            RESPECT • ÉQUITÉ • PASSION
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", fontSize: 28, color: "rgba(255,255,255,0.7)" }}>
        Le jeu nous rassemble, le fair play nous grandit.
      </div>
    </Fond>
  );
}
