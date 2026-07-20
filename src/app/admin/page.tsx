import Link from "next/link";
import { Users, Calendar, Newspaper, Images, Shield, LogOut } from "lucide-react";

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
