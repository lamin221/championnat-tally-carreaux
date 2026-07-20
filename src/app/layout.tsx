import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Toaster } from "sonner";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

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
    <html lang="fr" suppressHydrationWarning className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased font-body">
        <ThemeProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8 pb-24 lg:pb-8">{children}</main>
          <footer className="hidden lg:block border-t border-border py-6 mt-12 text-center text-sm text-foreground/60">
            © {new Date().getFullYear()} Championnat Tally Carreaux — Terrain Diéxal
          </footer>
          <MobileTabBar />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
