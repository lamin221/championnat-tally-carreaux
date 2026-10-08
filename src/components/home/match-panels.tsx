import Link from "next/link";
import { ArrowRight, CalendarClock, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { TeamBadge } from "@/components/ui/team-badge";
import { CountUp } from "./count-up";
import { Countdown } from "./countdown";
import type { Match, Team } from "@/types/database";

const PANEL =
  "relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] p-6 text-white shadow-xl shadow-blue-950/20 sm:p-8";

function Crest({ team, glow = false }: { team: Team; glow?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <div
        className={`rounded-full bg-white/10 p-1 ring-2 transition ${
          glow ? "ring-yellow-300/80 shadow-[0_0_28px_rgba(250,204,21,0.45)]" : "ring-white/25"
        }`}
      >
        <TeamBadge team={team} size={52} showName={false} />
      </div>
      <span className="w-full truncate text-sm font-semibold">{team.name}</span>
    </div>
  );
}

function Header({ children, live = false }: { children: React.ReactNode; live?: boolean }) {
  return (
    <div className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-yellow-300/90">
      {live && <span className="pulse-dot h-2 w-2 rounded-full bg-yellow-400" />}
      {children}
    </div>
  );
}

export function NextMatchPanel({
  match,
  home,
  away,
}: {
  match: Match | null;
  home?: Team;
  away?: Team;
}) {
  if (!match || !home || !away) {
    return (
      <div className={PANEL}>
        <Header>Prochain match</Header>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CalendarClock size={36} className="text-white/30" />
          <p className="text-sm text-white/60">Le prochain match sera annoncé très bientôt.</p>
        </div>
      </div>
    );
  }

  // Le Sénégal est à UTC+0 toute l'année : on lit donc la date/heure en UTC.
  const heure = (match.match_time ?? "00:00").slice(0, 5);
  const target = `${match.match_date}T${heure}:00Z`;

  return (
    <div className={PANEL}>
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-600/25 blur-3xl" />
      <div className="relative">
        <Header live>Prochain match</Header>

        <div className="flex items-center justify-between gap-3">
          <Crest team={home} />
          <span className="font-display text-xl text-white/40">VS</span>
          <Crest team={away} />
        </div>

        <div className="mt-7">
          <Countdown target={target} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/60">
          <span className="inline-flex items-center gap-1.5 capitalize">
            <CalendarClock size={13} className="text-yellow-300" />
            {format(parseISO(match.match_date), "EEEE d MMMM", { locale: fr })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-yellow-300" />
            {heure}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} className="text-yellow-300" />
            {match.venue}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LastMatchPanel({
  match,
  home,
  away,
}: {
  match: Match | null;
  home?: Team;
  away?: Team;
}) {
  if (!match || !home || !away) {
    return (
      <div className={PANEL}>
        <Header>Dernier match</Header>
        <p className="py-10 text-center text-sm text-white/60">Aucun match joué pour l&apos;instant.</p>
      </div>
    );
  }

  const hs = Number(match.home_score ?? 0);
  const as = Number(match.away_score ?? 0);
  const verdict = hs === as ? "Match nul" : `Victoire de ${hs > as ? home.name : away.name}`;

  return (
    <div className={PANEL}>
      <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-red-600/20 blur-3xl" />
      <div className="relative">
        <Header>Dernier match</Header>

        <div className="flex items-center justify-between gap-3">
          <Crest team={home} glow={hs > as} />
          <div className="score-numeral flex shrink-0 items-center gap-2 text-5xl leading-none sm:gap-3 sm:text-6xl">
            <span className={hs > as ? "text-yellow-300" : "text-white"}>
              <CountUp value={hs} />
            </span>
            <span className="text-white/30">–</span>
            <span className={as > hs ? "text-yellow-300" : "text-white"}>
              <CountUp value={as} />
            </span>
          </div>
          <Crest team={away} glow={as > hs} />
        </div>

        <p className="mt-6 text-center font-display text-sm uppercase tracking-[0.2em] text-yellow-300">
          {verdict}
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/55">
          <span className="capitalize">{format(parseISO(match.match_date), "d MMMM yyyy", { locale: fr })}</span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} className="text-yellow-300" />
            {match.venue}
          </span>
        </p>

        <Link
          href={`/matchs/${match.id}`}
          className="group btn-sheen mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:border-yellow-400/60 hover:bg-white/15"
        >
          Voir les détails
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
