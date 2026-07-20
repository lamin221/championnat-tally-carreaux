"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Trophy, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

const TABS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/matchs", label: "Matchs", icon: Calendar },
  { href: "/classements", label: "Classements", icon: Trophy },
];

const MORE_LINKS = [
  { href: "/joueurs", label: "Joueurs" },
  { href: "/records", label: "Records" },
  { href: "/confrontations", label: "Confrontations" },
  { href: "/galerie", label: "Galerie" },
  { href: "/actualites", label: "Actualités" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = MORE_LINKS.some((l) => l.href === pathname);

  return (
    <>
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-20 left-3 right-3 card p-2 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMoreOpen(false)}
                className={clsx(
                  "block px-4 py-3 rounded-xl text-sm font-medium",
                  pathname === link.href ? "bg-muted" : "hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-16">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <tab.icon
                  size={22}
                  className={active ? "text-tally" : "text-foreground/50"}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={clsx(
                    "text-[10px] font-medium",
                    active ? "text-tally" : "text-foreground/50"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex flex-col items-center justify-center gap-0.5"
          >
            {moreOpen ? (
              <X size={22} className="text-tally" strokeWidth={2.5} />
            ) : (
              <Menu
                size={22}
                className={isMoreActive ? "text-tally" : "text-foreground/50"}
                strokeWidth={isMoreActive ? 2.5 : 2}
              />
            )}
            <span
              className={clsx(
                "text-[10px] font-medium",
                isMoreActive || moreOpen ? "text-tally" : "text-foreground/50"
              )}
            >
              Plus
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
