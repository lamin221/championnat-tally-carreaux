import Link from "next/link";
import { ArrowUpRight, Medal, Images, Newspaper, Trophy } from "lucide-react";

const ITEMS = [
  { href: "/classements", titre: "Classements", texte: "Buteurs, passeurs, joueurs les plus décisifs", icone: Trophy, grad: "from-yellow-500 to-amber-700" },
  { href: "/records", titre: "Records", texte: "Les plus belles performances du championnat", icone: Medal, grad: "from-red-500 to-red-800" },
  { href: "/galerie", titre: "Galerie", texte: "Photos et vidéos des moments forts", icone: Images, grad: "from-blue-500 to-blue-800" },
  { href: "/actualites", titre: "Actualités", texte: "Résumés de matchs et annonces", icone: Newspaper, grad: "from-emerald-500 to-emerald-800" },
];

export function ExploreGrid() {
  return (
    <section>
      <h2 className="mb-5 text-lg font-semibold">Explorer le championnat</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ href, titre, texte, icone: Icone, grad }) => (
          <Link
            key={href}
            href={href}
            className="card group relative flex flex-col gap-4 overflow-hidden p-5 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div
              aria-hidden
              className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${grad} opacity-20 blur-2xl transition duration-500 group-hover:scale-150 group-hover:opacity-40`}
            />
            <span className={`relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-lg`}>
              <Icone size={20} />
            </span>
            <div className="relative">
              <h3 className="flex items-center justify-between text-base font-semibold">
                {titre}
                <ArrowUpRight
                  size={18}
                  className="text-muted-foreground transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{texte}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
