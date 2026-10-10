import Link from "next/link";
import { Users, Calendar, Newspaper, Images, Shield, LogOut, Zap, ArrowRight } from "lucide-react";

const SECTIONS = [
  { href: "/admin/equipes", label: "Gérer les équipes", icon: Shield },
  { href: "/admin/joueurs", label: "Gérer les joueurs", icon: Users },
  { href: "/admin/matchs", label: "Gérer les matchs", icon: Calendar },
  { href: "/admin/actualites", label: "Gérer les actualités", icon: Newspaper },
  { href: "/admin/galerie", label: "Gérer la galerie", icon: Images },
];

export default function AdminHome() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Administration</h1>

      <Link
        href="/admin/saisie"
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl sm:p-8"
      >
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-yellow-400/15 blur-3xl transition duration-500 group-hover:scale-150" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 shadow-lg">
              <Zap size={26} />
            </span>
            <div>
              <p className="text-lg font-bold sm:text-xl">Saisie rapide d&apos;un match</p>
              <p className="mt-1 text-sm text-white/65">
                Composition, buts, passes, sanctions et résultat en quelques touches.
              </p>
            </div>
          </div>
          <ArrowRight size={22} className="shrink-0 text-yellow-300 transition group-hover:translate-x-1.5" />
        </div>
      </Link>

      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <s.icon className="text-tally" size={28} />
            <span className="font-medium">{s.label}</span>
          </Link>
        ))}
      </div>
      <form action="/admin/logout" method="post">
        <button className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mt-4">
          <LogOut size={16} /> Se déconnecter
        </button>
      </form>
    </div>
  );
}
