import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Clock, MapPin, Star, Goal as GoalIcon, Users, ListOrdered } from "lucide-react";
import { getMatchById, getMatchDetails, getTeams, getPlayers } from "@/lib/queries";
import { TeamBadge } from "@/components/ui/team-badge";
import { CommentsSection } from "@/components/ui/comments-section";
import { ShareMatchButton } from "@/components/ui/share-match-button";
import { Reveal } from "@/components/home/reveal";
import { CountUp } from "@/components/home/count-up";
import { Countdown } from "@/components/home/countdown";
import type { Player, Team } from "@/types/database";

type Evenement = {
  key: string;
  minute: number | null;
  side: "home" | "away";
  kind: "goal" | "own" | "yellow" | "red";
  title: string;
  sub?: string;
};

function Crest({ team, win }: { team: Team; win: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
      <div
        className={`rounded-full bg-white/10 p-1.5 ring-2 shadow-xl transition ${
          win ? "ring-yellow-300/80 shadow-[0_0_34px_rgba(250,204,21,0.45)]" : "ring-white/25"
        }`}
      >
        <TeamBadge team={team} size={72} showName={false} />
      </div>
      <span className="w-full truncate font-display text-base font-semibold uppercase tracking-wide sm:text-xl">
        {team.name}
      </span>
    </div>
  );
}

function EventIcon({ kind }: { kind: Evenement["kind"] }) {
  if (kind === "goal") return <GoalIcon size={18} className="text-yellow-300" />;
  if (kind === "own") return <GoalIcon size={18} className="text-red-400" />;
  return <span className={`block h-5 w-3.5 rounded-[3px] ${kind === "red" ? "bg-red-500" : "bg-amber-400"}`} />;
}

function Lineup({ team, players }: { team: Team; players: Player[] }) {
  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500" />
      <h2 className="mb-4 flex items-center gap-2 font-display text-base font-semibold">
        <Users size={18} className="text-yellow-500" /> Composition — {team.name}
      </h2>
      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground">Composition non renseignée.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {players.map((p) => (
            <li key={p.id}>
              <Link
                href={`/joueurs/${p.id}`}
                className="group flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5 transition hover:-translate-y-0.5 hover:bg-border"
              >
                <span className="score-numeral w-8 text-center text-xl text-muted-foreground transition group-hover:text-yellow-500">
                  {p.jersey_number}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.full_name}</span>
                  <span className="block text-[11px] text-muted-foreground">{p.position}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [match, teams] = await Promise.all([getMatchById(id), getTeams()]);
  if (!match) return { title: "Match — Tally Carreaux" };

  const home = teams.find((t) => t.id === match.home_team_id);
  const away = teams.find((t) => t.id === match.away_team_id);
  if (!home || !away) return { title: "Match — Tally Carreaux" };

  const date = format(parseISO(match.match_date), "d MMMM yyyy", { locale: fr });
  const title =
    match.status === "termine"
      ? `${home.name} ${match.home_score} - ${match.away_score} ${away.name}`
      : `${home.name} vs ${away.name}`;
  const description =
    match.status === "termine"
      ? `Résultat du ${date} au ${match.venue} : buteurs, sanctions et compositions.`
      : `Match prévu le ${date} au ${match.venue}.`;

  return {
    title: `${title} — Tally Carreaux`,
    description,
    openGraph: { title, description, type: "article", locale: "fr_FR" },
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const [teams, players, details] = await Promise.all([
    getTeams(),
    getPlayers(),
    getMatchDetails(id),
  ]);

  const homeTeam = teams.find((t) => t.id === match.home_team_id)!;
  const awayTeam = teams.find((t) => t.id === match.away_team_id)!;
  const findPlayer = (pid: string) => players.find((p) => p.id === pid);
  const motm = match.man_of_the_match_id ? findPlayer(match.man_of_the_match_id) : null;

  const finished = match.status === "termine";
  const upcoming = match.status === "a_venir";
  const hs = Number(match.home_score ?? 0);
  const as = Number(match.away_score ?? 0);
  const heure = (match.match_time ?? "00:00").slice(0, 5);

  const lineupByTeam = (teamId: string) =>
    details.lineups
      .filter((l) => l.team_id === teamId)
      .map((l) => findPlayer(l.player_id))
      .filter((p): p is Player => Boolean(p));

  // Fil du match : buts et sanctions classés par minute
  const evenements: Evenement[] = [];
  for (const g of details.goals) {
    const scorer = findPlayer(g.scorer_id);
    const assist = g.assist_id ? findPlayer(g.assist_id) : null;
    evenements.push({
      key: `g-${g.id}`,
      minute: g.minute,
      side: g.team_id === homeTeam.id ? "home" : "away",
      kind: g.is_own_goal ? "own" : "goal",
      title: `${scorer?.full_name ?? "Joueur"}${g.is_own_goal ? " (c.s.c.)" : ""}`,
      sub: assist ? `Passe de ${assist.full_name}` : undefined,
    });
  }
  for (const s of details.sanctions) {
    const p = findPlayer(s.player_id);
    const rouge = s.type === "exclusion_definitive";
    evenements.push({
      key: `s-${s.id}`,
      minute: s.minute,
      side: p?.team_id === homeTeam.id ? "home" : "away",
      kind: rouge ? "red" : "yellow",
      title: p?.full_name ?? "Joueur",
      sub: rouge ? "Exclusion définitive" : "Suspension de 2 minutes",
    });
  }
  evenements.sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

  const dateLabel = format(parseISO(match.match_date), "EEEE d MMMM yyyy", { locale: fr });
  const shareText = finished
    ? `⚽ ${homeTeam.name} ${match.home_score} - ${match.away_score} ${awayTeam.name} — Championnat Tally Carreaux`
    : `📅 Prochain match : ${homeTeam.name} vs ${awayTeam.name} — Championnat Tally Carreaux`;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <Link
        href="/matchs"
        className="group inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
        Tous les matchs
      </Link>

      {/* Tableau d'affichage */}
      <section className="hero-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-2xl shadow-blue-950/40 sm:p-10">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-red-600/20 blur-3xl animate-orb" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl animate-orb [animation-delay:-5s]" />
        <div aria-hidden className="bg-carreaux-grid pointer-events-none absolute inset-0" />

        <div className="relative flex flex-col items-center gap-2 text-center text-sm text-white/65">
          <span className="capitalize">{dateLabel}</span>
          <span className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="text-yellow-300" /> {heure}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-yellow-300" /> {match.venue}
            </span>
          </span>
        </div>

        <div className="relative mt-8 flex items-center justify-between gap-3">
          <Crest team={homeTeam} win={finished && hs > as} />
          {finished ? (
            <div className="score-numeral flex shrink-0 items-center gap-2 text-6xl leading-none sm:gap-4 sm:text-8xl">
              <span className={hs > as ? "text-yellow-300" : ""}><CountUp value={hs} /></span>
              <span className="text-white/25">–</span>
              <span className={as > hs ? "text-yellow-300" : ""}><CountUp value={as} /></span>
            </div>
          ) : (
            <span className="font-display shrink-0 px-2 text-3xl text-white/35">VS</span>
          )}
          <Crest team={awayTeam} win={finished && as > hs} />
        </div>

        {upcoming && (
          <div className="relative mx-auto mt-8 max-w-md">
            <Countdown target={`${match.match_date}T${heure}:00Z`} />
          </div>
        )}
        {match.status === "annule" && (
          <p className="relative mt-6 text-center text-sm font-semibold uppercase tracking-widest text-red-300">
            Match annulé
          </p>
        )}

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          {motm && (
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 shadow-lg shadow-yellow-500/30">
              <Star size={16} className="fill-amber-950" /> Homme du match : {motm.full_name}
            </span>
          )}
          <ShareMatchButton
            variant="glass"
            title="Championnat Tally Carreaux"
            text={shareText}
            url={`https://championnat-tally-carreaux.vercel.app/matchs/${match.id}`}
          />
        </div>
      </section>

      {/* Fil du match */}
      <Reveal>
        <section className="card p-5 sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold">
            <ListOrdered size={18} className="text-yellow-500" /> Fil du match
          </h2>
          {evenements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun but ni sanction enregistré.</p>
          ) : (
            <ol className="relative">
              <span aria-hidden className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" />
              {evenements.map((e) => {
                const carte = (
                  <div
                    className={`inline-flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 ring-1 ring-border ${
                      e.side === "home" ? "flex-row-reverse text-right" : ""
                    }`}
                  >
                    <EventIcon kind={e.kind} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{e.title}</span>
                      {e.sub && <span className="block text-xs text-muted-foreground">{e.sub}</span>}
                    </span>
                  </div>
                );
                return (
                  <li key={e.key} className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5">
                    <div className="flex justify-end">{e.side === "home" ? carte : null}</div>
                    <span className="score-numeral z-10 grid h-10 min-w-10 place-items-center rounded-full bg-gradient-to-br from-[#0a1440] to-[#060b1f] px-2 text-sm text-yellow-300 ring-2 ring-yellow-400/40">
                      {e.minute !== null ? `${e.minute}'` : "–"}
                    </span>
                    <div className="flex justify-start">{e.side === "away" ? carte : null}</div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </Reveal>

      {/* Compositions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <Lineup team={homeTeam} players={lineupByTeam(homeTeam.id)} />
        </Reveal>
        <Reveal delay={120}>
          <Lineup team={awayTeam} players={lineupByTeam(awayTeam.id)} />
        </Reveal>
      </div>

      <CommentsSection matchId={match.id} />
    </div>
  );
}

export const revalidate = 0;
