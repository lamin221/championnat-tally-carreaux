"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { clsx } from "clsx";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/matchs", label: "Matchs" },
  { href: "/joueurs", label: "Joueurs" },
  { href: "/classements", label: "Classements" },
  { href: "/records", label: "Records" },
  { href: "/confrontations", label: "Confrontations" },
  { href: "/galerie", label: "Galerie" },
  { href: "/actualites", label: "Actualités" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-lg bg-background/80 border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <Trophy className="text-tally" size={22} />
          <span>
            <span className="text-tally">Tally</span> <span className="text-carreaux">Carreaux</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <ThemeToggle />
      </nav>
    </header>
  );
}
