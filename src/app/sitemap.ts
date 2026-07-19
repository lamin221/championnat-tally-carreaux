import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://votre-domaine.vercel.app";
  const routes = [
    "",
    "/matchs",
    "/joueurs",
    "/classements",
    "/records",
    "/confrontations",
    "/galerie",
    "/actualites",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
  }));
}
