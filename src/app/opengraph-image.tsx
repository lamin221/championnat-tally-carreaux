import { ImageResponse } from "next/og";
import { loadOgAssets, ogFonts, OG_SIZE, OG_CONTENT_TYPE, SiteShareCard } from "@/lib/og";

export const alt = "Championnat Tally Carreaux";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const { font, logo } = await loadOgAssets();
  return new ImageResponse(<SiteShareCard logo={logo} />, { ...size, fonts: ogFonts(font) });
}
