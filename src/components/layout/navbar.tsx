"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Trophy className="text-tally" size={22} />
          <span>Tally Carreaux</span>
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-border px-4 py-3 flex flex-col gap-1 animate-slide-up">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "px-3 py-2 rounded-lg text-sm font-medium",
                pathname === link.href ? "bg-muted" : "hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
