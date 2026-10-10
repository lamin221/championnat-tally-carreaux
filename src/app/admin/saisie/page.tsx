"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Goal as GoalIcon,
  Minus,
  PartyPopper,
  Plus,
  Repeat,
  Share2,
  ShieldAlert,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Goal, Match, Player, Sanction, SanctionType, Team } from "@/types/database";

// ---------------------------------------------------------------------------
// Saisie rapide d'un match : 5 étapes, pensées pour le téléphone.
// Tout est enregistré au fur et à mesure (rien n'est perdu si le téléphone se met en veille).
// Le score est calculé automatiquement à partir des buts saisis.
// ---------------------------------------------------------------------------

const ETAPES = ["Match", "Composition", "Buts", "Sanctions", "Terminer"];
const SITE = "https://championnat-tally-carreaux.vercel.app";

const nomJoueur = (p: Player) => p.nickname || p.full_name;
const aujourdhui = () => new Date().toISOString().slice(0, 10);

function Chip({
  actif,
  onClick,
  children,
  couleur = "blue",
}: {
  actif: boolean;
  onClick: () => void;
  children: React.ReactNode;
  couleur?: "blue" | "red" | "gold";
}) {
  const on = {
    blue: "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/30",
    red: "border-red-500 bg-red-600 text-white shadow-md shadow-red-600/30",
    gold: "border-yellow-400 bg-yellow-400 text-amber-950 shadow-md shadow-yellow-500/30",
  }[couleur];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition active:scale-95 ${
        actif ? on : "border-border bg-muted text-foreground hover:bg-border"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({ valeur, onChange }: { valeur: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, valeur - 1))}
        className="grid h-11 w-11 place-items-center rounded-xl bg-muted active:scale-95"
        aria-label="Moins un"
      >
        <Minus size={18} />
      </button>
      <span className="score-numeral w-10 text-center text-3xl">{valeur}</span>
      <button
        type="button"
        onClick={() => onChange(valeur + 1)}
        className="grid h-11 w-11 place-items-center rounded-xl bg-muted active:scale-95"
        aria-label="Plus un"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

export default function SaisieRapidePage() {
  const supabase = useMemo(() => createClient(), []);

  // Données
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [chargement, setChargement] = useState(true);

  // Parcours
  const [etape, setEtape] = useState(0);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [lineup, setLineup] = useState<Set<string>>(new Set());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [manuel, setManuel] = useState<{ home: number; away: number } | null>(null);
  const [motm, setMotm] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [termine, setTermine] = useState<{ id: string; texte: string } | null>(null);

  // Formulaires
  const [nouveau, setNouveau] = useState({ date: aujourdhui(), heure: "18:00", home: "", away: "" });
  const [formBut, setFormBut] = useState({ team: "", csc: false, scorer: "", assist: "", minute: "" });
  const [formSanction, setFormSanction] = useState<{ player: string; type: SanctionType; minute: string }>({
    player: "",
    type: "suspension_2min",
    minute: "",
  });

  const charger = useCallback(async () => {
    const [{ data: t }, { data: p }, { data: m }] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*").order("jersey_number"),
      supabase.from("matches").select("*").order("match_date", { ascending: false }),
    ]);
    setTeams((t ?? []) as Team[]);
    setPlayers((p ?? []) as Player[]);
    setMatches((m ?? []) as Match[]);
    if (t && t.length >= 2) {
      setNouveau((n) => (n.home ? n : { ...n, home: t[0].id, away: t[1].id }));
    }
    setChargement(false);
  }, [supabase]);

  useEffect(() => {
    charger();
  }, [charger]);

  // --- Dérivés -------------------------------------------------------------
  const match = matches.find((m) => m.id === matchId) ?? null;
  const home = teams.find((t) => t.id === match?.home_team_id);
  const away = teams.find((t) => t.id === match?.away_team_id);

  const calcule = useMemo(() => {
    if (!match) return { home: 0, away: 0 };
    return {
      home: goals.filter((g) => g.team_id === match.home_team_id).length,
      away: goals.filter((g) => g.team_id === match.away_team_id).length,
    };
  }, [goals, match]);
  const score = manuel ?? calcule;

  const joueursDe = (teamId: string) => players.filter((p) => p.team_id === teamId);
  // Si une composition est enregistrée, on ne propose que ces joueurs ; sinon tout l'effectif.
  const disponibles = (teamId: string) => {
    const tous = joueursDe(teamId);
    const presents = tous.filter((p) => lineup.has(p.id));
    return presents.length > 0 ? presents : tous;
  };

  // --- Sélection / création d'un match ------------------------------------
  async function choisirMatch(m: Match) {
    setOccupe(true);
    const [{ data: l }, { data: g }, { data: s }] = await Promise.all([
      supabase.from("match_lineups").select("player_id").eq("match_id", m.id),
      supabase.from("goals").select("*").eq("match_id", m.id).order("minute"),
      supabase.from("sanctions").select("*").eq("match_id", m.id).order("minute"),
    ]);
    const buts = (g ?? []) as Goal[];
    setLineup(new Set((l ?? []).map((x: { player_id: string }) => x.player_id)));
    setGoals(buts);
    setSanctions((s ?? []) as Sanction[]);
    setMotm(m.man_of_the_match_id ?? "");

    // Score enregistré qui ne correspond pas aux buts saisis : on le conserve en mode manuel.
    const h = buts.filter((x) => x.team_id === m.home_team_id).length;
    const a = buts.filter((x) => x.team_id === m.away_team_id).length;
    const sh = Number(m.home_score ?? 0);
    const sa = Number(m.away_score ?? 0);
    setManuel(m.status === "termine" && (sh !== h || sa !== a) ? { home: sh, away: sa } : null);

    setFormBut({ team: m.home_team_id, csc: false, scorer: "", assist: "", minute: "" });
    setFormSanction({ player: "", type: "suspension_2min", minute: "" });
    setMatchId(m.id);
    setTermine(null);
    setEtape(1);
    setOccupe(false);
  }

  async function creerMatch() {
    if (!nouveau.home || !nouveau.away || nouveau.home === nouveau.away) {
      return toast.error("Choisis deux équipes différentes.");
    }
    setOccupe(true);
    const { data, error } = await supabase
      .from("matches")
      .insert({
        match_date: nouveau.date,
        match_time: nouveau.heure,
        home_team_id: nouveau.home,
        away_team_id: nouveau.away,
        home_score: 0,
        away_score: 0,
        status: "a_venir",
      })
      .select()
      .single();
    setOccupe(false);
    if (error || !data) return toast.error(`Erreur : ${error?.message}`);
    setMatches((prev) => [data as Match, ...prev]);
    await choisirMatch(data as Match);
  }

  // --- Composition ----------------------------------------------------------
  function basculerJoueur(id: string) {
    setLineup((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toutChoisir(teamId: string, tous: boolean) {
    setLineup((prev) => {
      const next = new Set(prev);
      joueursDe(teamId).forEach((p) => (tous ? next.add(p.id) : next.delete(p.id)));
      return next;
    });
  }

  async function enregistrerComposition() {
    if (!match) return false;
    setOccupe(true);
    const { error: e1 } = await supabase.from("match_lineups").delete().eq("match_id", match.id);
    if (e1) {
      setOccupe(false);
      toast.error(`Erreur : ${e1.message}`);
      return false;
    }
    if (lineup.size > 0) {
      const rows = Array.from(lineup).map((pid) => ({
        match_id: match.id,
        player_id: pid,
        team_id: players.find((p) => p.id === pid)!.team_id,
        is_starter: true,
      }));
      const { error: e2 } = await supabase.from("match_lineups").insert(rows);
      if (e2) {
        setOccupe(false);
        toast.error(`Erreur : ${e2.message}`);
        return false;
      }
    }
    setOccupe(false);
    return true;
  }

  // --- Buts -----------------------------------------------------------------
  // Le score en base suit les buts saisis (utile aussi pour un futur suivi en direct).
  async function synchroniserScore(nouveauxButs: Goal[]) {
    if (!match || manuel) return;
    const h = nouveauxButs.filter((g) => g.team_id === match.home_team_id).length;
    const a = nouveauxButs.filter((g) => g.team_id === match.away_team_id).length;
    const { error } = await supabase.from("matches").update({ home_score: h, away_score: a }).eq("id", match.id);
    if (error) toast.error(`Score non synchronisé : ${error.message}`);
    else setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, home_score: h, away_score: a } : m)));
  }

  async function ajouterBut() {
    if (!match) return;
    if (!formBut.team || !formBut.scorer) return toast.error("Choisis l'équipe et le buteur.");
    setOccupe(true);
    const { data, error } = await supabase
      .from("goals")
      .insert({
        match_id: match.id,
        scorer_id: formBut.scorer,
        assist_id: formBut.csc ? null : formBut.assist || null,
        team_id: formBut.team,
        minute: formBut.minute ? Number(formBut.minute) : null,
        is_own_goal: formBut.csc,
      })
      .select()
      .single();
    setOccupe(false);
    if (error || !data) return toast.error(`Erreur : ${error?.message}`);
    const suite = [...goals, data as Goal].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));
    setGoals(suite);
    synchroniserScore(suite);
    setFormBut({ team: formBut.team, csc: false, scorer: "", assist: "", minute: "" });
    toast.success("But ajouté.");
  }

  async function supprimerBut(id: string) {
    if (!confirm("Supprimer ce but ?")) return;
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) return toast.error(`Erreur : ${error.message}`);
    const suite = goals.filter((g) => g.id !== id);
    setGoals(suite);
    synchroniserScore(suite);
  }

  // --- Sanctions ------------------------------------------------------------
  async function ajouterSanction() {
    if (!match) return;
    if (!formSanction.player) return toast.error("Choisis un joueur.");
    setOccupe(true);
    const { data, error } = await supabase
      .from("sanctions")
      .insert({
        match_id: match.id,
        player_id: formSanction.player,
        type: formSanction.type,
        minute: formSanction.minute ? Number(formSanction.minute) : null,
      })
      .select()
      .single();
    setOccupe(false);
    if (error || !data) return toast.error(`Erreur : ${error?.message}`);
    setSanctions((prev) => [...prev, data as Sanction].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999)));
    setFormSanction({ player: "", type: formSanction.type, minute: "" });
    toast.success("Sanction ajoutée.");
  }

  async function supprimerSanction(id: string) {
    if (!confirm("Supprimer cette sanction ?")) return;
    const { error } = await supabase.from("sanctions").delete().eq("id", id);
    if (error) return toast.error(`Erreur : ${error.message}`);
    setSanctions((prev) => prev.filter((s) => s.id !== id));
  }

  // --- Terminer -------------------------------------------------------------
  async function terminer(publier: boolean) {
    if (!match || !home || !away) return;
    setOccupe(true);
    const { error } = await supabase
      .from("matches")
      .update({
        home_score: score.home,
        away_score: score.away,
        status: publier ? "termine" : "en_cours",
        man_of_the_match_id: motm || null,
      })
      .eq("id", match.id);
    setOccupe(false);
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success(publier ? "Résultat publié !" : "Match enregistré (en cours).");
    setMatches((prev) =>
      prev.map((m) =>
        m.id === match.id
          ? { ...m, home_score: score.home, away_score: score.away, status: publier ? "termine" : "en_cours" }
          : m
      )
    );
    setTermine({
      id: match.id,
      texte: `⚽ ${home.name} ${score.home} - ${score.away} ${away.name} — Championnat Tally Carreaux`,
    });
  }

  function recommencer() {
    setMatchId(null);
    setTermine(null);
    setEtape(0);
    setLineup(new Set());
    setGoals([]);
    setSanctions([]);
    setManuel(null);
    setMotm("");
    charger();
  }

  async function suivant() {
    if (etape === 1) {
      const ok = await enregistrerComposition();
      if (!ok) return;
    }
    setEtape((e) => Math.min(4, e + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function retour() {
    setEtape((e) => Math.max(0, e - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Suggestion pour l'homme du match : le meilleur buteur
  const suggestion = useMemo(() => {
    const compte = new Map<string, number>();
    goals.filter((g) => !g.is_own_goal).forEach((g) => compte.set(g.scorer_id, (compte.get(g.scorer_id) ?? 0) + 1));
    return Array.from(compte.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  }, [goals]);

  const aVenir = matches
    .filter((m) => m.status === "a_venir" || m.status === "en_cours")
    .sort((a, b) => a.match_date.localeCompare(b.match_date));
  const termines = matches.filter((m) => m.status === "termine").slice(0, 8);
  const nomEquipe = (id: string) => teams.find((t) => t.id === id)?.name ?? "—";

  if (chargement) return <p className="py-10 text-center text-sm text-muted-foreground">Chargement…</p>;

  // ======================= Écran final =======================================
  if (termine && match) {
    const lien = `${SITE}/matchs/${termine.id}`;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-10 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 shadow-xl">
          <PartyPopper size={36} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">C&apos;est enregistré !</h1>
          <p className="mt-2 text-sm text-muted-foreground">{termine.texte.replace("⚽ ", "")}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${termine.texte} ${lien}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg active:scale-[0.98]"
          >
            <Share2 size={18} /> Partager sur WhatsApp
          </a>
          <Link
            href={`/matchs/${termine.id}`}
            className="flex min-h-12 items-center justify-center rounded-xl border border-border px-5 py-3 font-medium hover:bg-muted"
          >
            Voir la page du match
          </Link>
          <button onClick={recommencer} className="min-h-12 rounded-xl bg-muted px-5 py-3 font-medium hover:bg-border">
            Saisir un autre match
          </button>
        </div>
      </div>
    );
  }

  // ======================= Parcours ==========================================
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Saisie rapide</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          Administration
        </Link>
      </div>

      {/* Barre d'étapes */}
      <ol className="grid grid-cols-5 gap-1.5">
        {ETAPES.map((nom, i) => {
          const accessible = i === 0 || Boolean(match);
          return (
            <li key={nom}>
              <button
                disabled={!accessible}
                onClick={() => i === 0 ? recommencer() : setEtape(i)}
                className="w-full text-center disabled:opacity-40"
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors ${
                    i < etape ? "bg-emerald-500" : i === etape ? "bg-yellow-400" : "bg-muted"
                  }`}
                />
                <span className={`mt-1.5 block text-[10px] font-medium sm:text-xs ${i === etape ? "text-foreground" : "text-muted-foreground"}`}>
                  {nom}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Tableau de score permanent */}
      {match && home && away && etape > 0 && (
        <div className="sticky top-[4.25rem] z-20 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#060b1f] via-[#0a1440] to-[#060b1f] px-4 py-3 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{home.name}</span>
            <span className="score-numeral shrink-0 text-3xl leading-none text-yellow-300">
              {score.home} <span className="text-white/30">–</span> {score.away}
            </span>
            <span className="min-w-0 flex-1 truncate text-right text-sm font-semibold">{away.name}</span>
          </div>
        </div>
      )}

      {/* ---------------- Étape 0 : choix du match ---------------- */}
      {etape === 0 && (
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quel match ?</h2>
            {aVenir.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Aucun match à venir. Crée-en un ci-dessous.
              </p>
            )}
            {aVenir.map((m) => (
              <button
                key={m.id}
                onClick={() => choisirMatch(m)}
                disabled={occupe}
                className="card flex min-h-16 items-center justify-between gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
              >
                <span>
                  <span className="block font-semibold">
                    {nomEquipe(m.home_team_id)} <span className="text-muted-foreground">vs</span> {nomEquipe(m.away_team_id)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {m.match_date} — {m.match_time?.slice(0, 5)} — {m.status === "en_cours" ? "en cours" : "à venir"}
                  </span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-muted-foreground" />
              </button>
            ))}
          </section>

          <section className="card flex flex-col gap-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nouveau match</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={nouveau.date}
                onChange={(e) => setNouveau({ ...nouveau, date: e.target.value })}
                className="min-h-11 rounded-xl border border-border bg-background px-3"
              />
              <input
                type="time"
                value={nouveau.heure}
                onChange={(e) => setNouveau({ ...nouveau, heure: e.target.value })}
                className="min-h-11 rounded-xl border border-border bg-background px-3"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <select
                value={nouveau.home}
                onChange={(e) => setNouveau({ ...nouveau, home: e.target.value })}
                className="min-h-11 rounded-xl border border-border bg-background px-3"
              >
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setNouveau({ ...nouveau, home: nouveau.away, away: nouveau.home })}
                className="grid h-11 w-11 place-items-center rounded-xl bg-muted active:scale-95"
                aria-label="Inverser domicile et extérieur"
              >
                <Repeat size={16} />
              </button>
              <select
                value={nouveau.away}
                onChange={(e) => setNouveau({ ...nouveau, away: e.target.value })}
                className="min-h-11 rounded-xl border border-border bg-background px-3"
              >
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button
              onClick={creerMatch}
              disabled={occupe}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tally px-4 font-semibold text-white disabled:opacity-50"
            >
              <Plus size={18} /> Créer et commencer la saisie
            </button>
          </section>

          {termines.length > 0 && (
            <details className="card group p-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium">
                Corriger un match terminé
                <ChevronDown size={18} className="transition group-open:rotate-180" />
              </summary>
              <div className="mt-3 flex flex-col gap-2">
                {termines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => choisirMatch(m)}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-muted px-4 text-left text-sm hover:bg-border"
                  >
                    <span>
                      {nomEquipe(m.home_team_id)} {m.home_score} – {m.away_score} {nomEquipe(m.away_team_id)}
                    </span>
                    <span className="text-xs text-muted-foreground">{m.match_date}</span>
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* ---------------- Étape 1 : composition ---------------- */}
      {etape === 1 && match && home && away && (
        <div className="flex flex-col gap-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} /> Touche les joueurs qui ont joué. Tu peux passer cette étape.
          </p>
          {[home, away].map((team, i) => (
            <section key={team.id} className="card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-semibold">
                  {team.name}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({joueursDe(team.id).filter((p) => lineup.has(p.id)).length}/{joueursDe(team.id).length})
                  </span>
                </h2>
                <span className="flex gap-2 text-xs">
                  <button onClick={() => toutChoisir(team.id, true)} className="rounded-lg bg-muted px-3 py-2 font-medium">Tous</button>
                  <button onClick={() => toutChoisir(team.id, false)} className="rounded-lg bg-muted px-3 py-2 font-medium">Aucun</button>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {joueursDe(team.id).map((p) => (
                  <Chip key={p.id} actif={lineup.has(p.id)} couleur={i === 0 ? "red" : "blue"} onClick={() => basculerJoueur(p.id)}>
                    <span className="mr-1.5 font-bold">#{p.jersey_number}</span>
                    {nomJoueur(p)}
                  </Chip>
                ))}
                {joueursDe(team.id).length === 0 && (
                  <p className="col-span-2 text-sm text-muted-foreground">Aucun joueur dans cette équipe.</p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ---------------- Étape 2 : buts ---------------- */}
      {etape === 2 && match && home && away && (
        <div className="flex flex-col gap-5">
          <section className="card flex flex-col gap-4 p-4">
            <h2 className="flex items-center gap-2 font-semibold"><GoalIcon size={18} className="text-yellow-500" /> Ajouter un but</h2>

            <div className="grid grid-cols-2 gap-2">
              {[home, away].map((t, i) => (
                <Chip
                  key={t.id}
                  actif={formBut.team === t.id}
                  couleur={i === 0 ? "red" : "blue"}
                  onClick={() => setFormBut({ ...formBut, team: t.id, scorer: "", assist: "" })}
                >
                  <span className="block truncate text-center">{t.name}</span>
                </Chip>
              ))}
            </div>

            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={formBut.csc}
                onChange={(e) => setFormBut({ ...formBut, csc: e.target.checked, scorer: "", assist: "" })}
              />
              But contre son camp
            </label>

            {formBut.team && (
              <>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {formBut.csc ? "Qui a marqué contre son camp ?" : "Buteur"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {disponibles(
                      formBut.csc ? (formBut.team === home.id ? away.id : home.id) : formBut.team
                    ).map((p) => (
                      <Chip
                        key={p.id}
                        actif={formBut.scorer === p.id}
                        couleur="gold"
                        onClick={() => setFormBut({ ...formBut, scorer: formBut.scorer === p.id ? "" : p.id })}
                      >
                        <span className="mr-1.5 font-bold">#{p.jersey_number}</span>
                        {nomJoueur(p)}
                      </Chip>
                    ))}
                  </div>
                </div>

                {!formBut.csc && formBut.scorer && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Passeur (facultatif)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {disponibles(formBut.team)
                        .filter((p) => p.id !== formBut.scorer)
                        .map((p) => (
                          <Chip
                            key={p.id}
                            actif={formBut.assist === p.id}
                            onClick={() => setFormBut({ ...formBut, assist: formBut.assist === p.id ? "" : p.id })}
                          >
                            <span className="mr-1.5 font-bold">#{p.jersey_number}</span>
                            {nomJoueur(p)}
                          </Chip>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={130}
                    placeholder="Minute"
                    value={formBut.minute}
                    onChange={(e) => setFormBut({ ...formBut, minute: e.target.value })}
                    className="min-h-12 w-28 rounded-xl border border-border bg-background px-3 text-center text-lg"
                  />
                  <button
                    onClick={ajouterBut}
                    disabled={occupe || !formBut.scorer}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-tally px-4 font-semibold text-white disabled:opacity-40"
                  >
                    <Check size={18} /> Valider le but
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Liste des buts */}
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Buts saisis ({goals.length})
            </h2>
            {goals.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Aucun but pour l&apos;instant.
              </p>
            )}
            {goals.map((g) => {
              const buteur = players.find((p) => p.id === g.scorer_id);
              const passeur = g.assist_id ? players.find((p) => p.id === g.assist_id) : null;
              return (
                <div key={g.id} className="card flex items-center gap-3 p-3">
                  <span className="score-numeral grid h-10 min-w-10 place-items-center rounded-full bg-gradient-to-br from-[#0a1440] to-[#060b1f] px-2 text-sm text-yellow-300">
                    {g.minute !== null ? `${g.minute}'` : "–"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {buteur ? nomJoueur(buteur) : "Joueur"}
                      {g.is_own_goal && <span className="text-red-500"> (csc)</span>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {nomEquipe(g.team_id)}
                      {passeur ? ` — passe de ${nomJoueur(passeur)}` : ""}
                    </span>
                  </span>
                  <button
                    onClick={() => supprimerBut(g.id)}
                    className="grid h-11 w-11 place-items-center rounded-xl text-red-600 hover:bg-muted"
                    aria-label="Supprimer le but"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </section>

          {/* Score manuel */}
          <section className="card p-4">
            {manuel ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Score saisi à la main</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-center">
                    <p className="mb-1 text-xs text-muted-foreground">{home.name}</p>
                    <Stepper valeur={manuel.home} onChange={(n) => setManuel({ ...manuel, home: n })} />
                  </div>
                  <div className="text-center">
                    <p className="mb-1 text-xs text-muted-foreground">{away.name}</p>
                    <Stepper valeur={manuel.away} onChange={(n) => setManuel({ ...manuel, away: n })} />
                  </div>
                </div>
                <button onClick={() => setManuel(null)} className="min-h-11 rounded-xl bg-muted text-sm font-medium">
                  Revenir au calcul automatique
                </button>
              </div>
            ) : (
              <button
                onClick={() => setManuel({ home: calcule.home, away: calcule.away })}
                className="min-h-11 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Je ne connais pas tous les buteurs : saisir le score à la main
              </button>
            )}
          </section>
        </div>
      )}

      {/* ---------------- Étape 3 : sanctions ---------------- */}
      {etape === 3 && match && home && away && (
        <div className="flex flex-col gap-5">
          <section className="card flex flex-col gap-4 p-4">
            <h2 className="flex items-center gap-2 font-semibold"><ShieldAlert size={18} className="text-red-500" /> Ajouter une sanction</h2>

            <div className="grid grid-cols-2 gap-2">
              <Chip actif={formSanction.type === "suspension_2min"} couleur="gold" onClick={() => setFormSanction({ ...formSanction, type: "suspension_2min" })}>
                <span className="block text-center">Suspension 2 min</span>
              </Chip>
              <Chip actif={formSanction.type === "exclusion_definitive"} couleur="red" onClick={() => setFormSanction({ ...formSanction, type: "exclusion_definitive" })}>
                <span className="block text-center">Exclusion</span>
              </Chip>
            </div>

            {[home, away].map((team) => (
              <div key={team.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{team.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  {disponibles(team.id).map((p) => (
                    <Chip
                      key={p.id}
                      actif={formSanction.player === p.id}
                      onClick={() => setFormSanction({ ...formSanction, player: formSanction.player === p.id ? "" : p.id })}
                    >
                      <span className="mr-1.5 font-bold">#{p.jersey_number}</span>
                      {nomJoueur(p)}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={130}
                placeholder="Minute"
                value={formSanction.minute}
                onChange={(e) => setFormSanction({ ...formSanction, minute: e.target.value })}
                className="min-h-12 w-28 rounded-xl border border-border bg-background px-3 text-center text-lg"
              />
              <button
                onClick={ajouterSanction}
                disabled={occupe || !formSanction.player}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-tally px-4 font-semibold text-white disabled:opacity-40"
              >
                <Check size={18} /> Valider la sanction
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sanctions saisies ({sanctions.length})
            </h2>
            {sanctions.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Aucune sanction. Tu peux passer à l&apos;étape suivante.
              </p>
            )}
            {sanctions.map((s) => {
              const p = players.find((x) => x.id === s.player_id);
              return (
                <div key={s.id} className="card flex items-center gap-3 p-3">
                  <span className={`block h-6 w-4 shrink-0 rounded-[3px] ${s.type === "exclusion_definitive" ? "bg-red-500" : "bg-amber-400"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p ? nomJoueur(p) : "Joueur"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.type === "exclusion_definitive" ? "Exclusion définitive" : "Suspension 2 minutes"}
                      {s.minute !== null ? ` — ${s.minute}'` : ""}
                    </span>
                  </span>
                  <button
                    onClick={() => supprimerSanction(s.id)}
                    className="grid h-11 w-11 place-items-center rounded-xl text-red-600 hover:bg-muted"
                    aria-label="Supprimer la sanction"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </section>
        </div>
      )}

      {/* ---------------- Étape 4 : terminer ---------------- */}
      {etape === 4 && match && home && away && (
        <div className="flex flex-col gap-5">
          <section className="card p-5 text-center">
            <p className="text-sm text-muted-foreground">Résultat final</p>
            <p className="score-numeral mt-2 text-5xl">
              {score.home} <span className="text-muted-foreground">–</span> {score.away}
            </p>
            <p className="mt-2 text-sm font-medium">
              {home.name} contre {away.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {goals.length} but{goals.length > 1 ? "s" : ""} — {sanctions.length} sanction{sanctions.length > 1 ? "s" : ""} — {lineup.size} joueur{lineup.size > 1 ? "s" : ""} dans la composition
            </p>
            {!manuel && calcule.home + calcule.away === 0 && (
              <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                Aucun but saisi : le score est 0 – 0. Reviens à l&apos;étape « Buts » si ce n&apos;est pas le cas.
              </p>
            )}
          </section>

          <section className="card p-4">
            <h2 className="mb-1 flex items-center gap-2 font-semibold"><Star size={18} className="text-yellow-500" /> Homme du match</h2>
            {suggestion && !motm && (
              <button onClick={() => setMotm(suggestion)} className="mb-3 text-xs text-muted-foreground underline-offset-4 hover:underline">
                Suggestion : le meilleur buteur ({nomJoueur(players.find((p) => p.id === suggestion)!)})
              </button>
            )}
            {[home, away].map((team) => (
              <div key={team.id} className="mt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{team.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  {disponibles(team.id).map((p) => (
                    <Chip key={p.id} actif={motm === p.id} couleur="gold" onClick={() => setMotm(motm === p.id ? "" : p.id)}>
                      <span className="mr-1.5 font-bold">#{p.jersey_number}</span>
                      {nomJoueur(p)}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => terminer(true)}
              disabled={occupe}
              className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 text-lg font-bold text-white shadow-lg disabled:opacity-50"
            >
              <Check size={22} /> Publier le résultat
            </button>
            <button
              onClick={() => terminer(false)}
              disabled={occupe}
              className="min-h-12 rounded-xl bg-muted px-5 font-medium hover:bg-border disabled:opacity-50"
            >
              Enregistrer sans terminer (match en cours)
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {etape > 0 && match && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button onClick={retour} className="flex min-h-12 items-center gap-2 rounded-xl bg-muted px-5 font-medium active:scale-95">
            <ArrowLeft size={18} /> Retour
          </button>
          {etape < 4 && (
            <button
              onClick={suivant}
              disabled={occupe}
              className="flex min-h-12 items-center gap-2 rounded-xl bg-tally px-6 font-semibold text-white disabled:opacity-50 active:scale-95"
            >
              Suivant <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
