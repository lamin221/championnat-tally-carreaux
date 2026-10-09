import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Goal, Handshake, Star, Clock, ShieldAlert, ShieldX, Flame } from "lucide-react";
import { getPlayerById, getPlayerStats, getTeams } from "@/lib/queries";
import { StatTile } from "@/components/home/stat-tile";
import { Reveal } from "@/components/home/reveal";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  const [stats, teams] = await Promise.all([getPlayerStats(), getTeams()]);
  const playerStats = stats.find((s) => s.player_id === id);
  const team = teams.find((t) => t.id === player.team_id);
  const couleur = team?.primary_color || "#1E40AF";
  const clair = `color-mix(in srgb, ${couleur} 55%, white)`;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <Link
        href="/joueurs"
        className="group inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
        Tous les joueurs
      </Link>

      <section className="hero-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-2xl shadow-blue-950/40 sm:p-10">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${clair}, transparent)` }} />
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl animate-orb" />
        <div aria-hidden className="bg-carreaux-grid pointer-events-none absolute inset-0" />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-10 right-2 font-display text-[200px] font-bold leading-none text-white/[0.05] sm:text-[260px]"
        >
          {player.jersey_number}
        </span>

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="animate-float">
            {player.photo_url ? (
              <Image
                src={player.photo_url}
                alt={player.full_name}
                width={144}
                height={144}
                priority
                className="h-36 w-36 rounded-full object-cover shadow-2xl"
                style={{ boxShadow: `0 0 0 4px ${clair}, 0 20px 50px rgba(0,0,0,.5)` }}
              />
            ) : (
              <div
                className="grid h-36 w-36 place-items-center rounded-full font-display text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${couleur}, #060b1f)`,
                  boxShadow: `0 0 0 4px ${clair}, 0 20px 50px rgba(0,0,0,.5)`,
                }}
              >
                {player.jersey_number}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-yellow-300">
              {team?.name} — #{player.jersey_number}
            </span>
            <h1 className="mt-3 text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
              {player.full_name}
            </h1>
            {player.nickname && <p className="mt-2 text-lg text-white/60">« {player.nickname} »</p>}
            <span className="mt-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
              {player.position}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Matchs joués", value: playerStats?.matches_played ?? 0, icon: Clock, tone: "navy" },
          { label: "Buts", value: playerStats?.goals ?? 0, icon: Goal, tone: "red" },
          { label: "Passes décisives", value: playerStats?.assists ?? 0, icon: Handshake, tone: "blue" },
          { label: "Homme du match", value: playerStats?.man_of_the_match_count ?? 0, icon: Star, tone: "gold" },
          { label: "Contributions offensives", value: playerStats?.goal_contributions ?? 0, icon: Flame, tone: "navy" },
          { label: "Suspensions 2 min", value: playerStats?.suspensions_2min ?? 0, icon: ShieldAlert, tone: "navy" },
          { label: "Exclusions définitives", value: playerStats?.exclusions_definitives ?? 0, icon: ShieldX, tone: "navy" },
        ].map((t, i) => (
          <Reveal key={t.label} delay={(i % 4) * 90} className="h-full">
            <StatTile label={t.label} value={t.value} icon={t.icon} tone={t.tone as "navy" | "red" | "blue" | "gold"} />
          </Reveal>
        ))}
      </section>
    </div>
  );
}

export const revalidate = 0;
