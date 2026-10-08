import { CalendarDays, Goal, Trophy, Swords } from "lucide-react";
import { HeroChampionnat } from "@/components/home/hero-championnat";
import { OctobreRoseBanner } from "@/components/home/octobre-rose-banner";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { Reveal } from "@/components/home/reveal";
import { StatTile } from "@/components/home/stat-tile";
import { VersusBoard } from "@/components/home/versus-board";
import { NextMatchPanel, LastMatchPanel } from "@/components/home/match-panels";
import { FormGuide } from "@/components/home/form-guide";
import { ExploreGrid } from "@/components/home/explore-grid";
import {
  getTeams,
  getTeamStats,
  getLastAndNextMatch,
  getTeamRecentForm,
  getHeadToHead,
} from "@/lib/queries";

export default async function DashboardPage() {
  const [teams, teamStats, { lastMatch, nextMatch }, h2h] = await Promise.all([
    getTeams(),
    getTeamStats(),
    getLastAndNextMatch(),
    getHeadToHead(),
  ]);

  const [teamA, teamB] = teams;
  const statsA = teamStats.find((s) => s.team_id === teamA?.id);
  const statsB = teamStats.find((s) => s.team_id === teamB?.id);

  const [formA, formB] = await Promise.all([
    teamA ? getTeamRecentForm(teamA.id) : Promise.resolve([]),
    teamB ? getTeamRecentForm(teamB.id) : Promise.resolve([]),
  ]);

  const totalMatches = h2h?.total_matches ?? 0;
  const totalDraws = h2h?.draws ?? 0;
  const totalGoals = (h2h?.total_home_goals ?? 0) + (h2h?.total_away_goals ?? 0);

  const findTeam = (id?: string | null) => teams.find((t) => t.id === id);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <OctobreRoseBanner />

      <HeroChampionnat
        imageSrc="/images/hero-match.jpg"
        imageAlt="Duel pour le ballon — championnat Tally Carreaux"
        totalMatches={totalMatches}
        totalGoals={totalGoals}
      />

      <BrandMarquee />

      {/* Chiffres clés */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Reveal delay={0}>
          <StatTile label="Matchs joués" value={totalMatches} icon={CalendarDays} tone="navy" />
        </Reveal>
        <Reveal delay={90}>
          <StatTile label="Buts marqués" value={totalGoals} icon={Goal} tone="gold" />
        </Reveal>
        <Reveal delay={180}>
          <StatTile
            label={`Victoires ${teamA?.name ?? "Équipe A"}`}
            value={statsA?.wins ?? 0}
            icon={Trophy}
            tone="red"
          />
        </Reveal>
        <Reveal delay={270}>
          <StatTile
            label={`Victoires ${teamB?.name ?? "Équipe B"}`}
            value={statsB?.wins ?? 0}
            icon={Swords}
            tone="blue"
          />
        </Reveal>
      </section>

      {/* Face-à-face */}
      {teamA && teamB && (
        <Reveal>
          <VersusBoard
            teamA={teamA}
            teamB={teamB}
            statsA={statsA}
            statsB={statsB}
            draws={totalDraws}
          />
        </Reveal>
      )}

      {/* Prochain match + dernier match */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal className="h-full">
          <NextMatchPanel
            match={nextMatch}
            home={findTeam(nextMatch?.home_team_id)}
            away={findTeam(nextMatch?.away_team_id)}
          />
        </Reveal>
        <Reveal delay={120} className="h-full">
          <LastMatchPanel
            match={lastMatch}
            home={findTeam(lastMatch?.home_team_id)}
            away={findTeam(lastMatch?.away_team_id)}
          />
        </Reveal>
      </section>

      {/* Forme récente */}
      {teamA && teamB && (
        <Reveal>
          <FormGuide
            rows={[
              { team: teamA, form: formA },
              { team: teamB, form: formB },
            ]}
          />
        </Reveal>
      )}

      <Reveal>
        <ExploreGrid />
      </Reveal>
    </div>
  );
}

export const revalidate = 0;
