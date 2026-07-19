import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Championnat Tally Carreaux",
  description:
    "Plateforme officielle du championnat de football Tally Carreaux : historique des matchs, statistiques des joueurs et des équipes, classements et records en temps réel.",
  keywords: ["championnat", "football", "Tally", "Carreaux", "statistiques"],
  openGraph: {
    title: "Championnat Tally Carreaux",
    description: "Suivez tous les matchs, stats et records du championnat.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
          <footer className="border-t border-border py-6 mt-12 text-center text-sm text-foreground/60">
            © {new Date().getFullYear()} Championnat Tally Carreaux — Terrain Diéxal
          </footer>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
