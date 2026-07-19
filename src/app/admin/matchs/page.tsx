"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Match, MatchStatus, Player, Team } from "@/types/database";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, Goal, ShieldAlert } from "lucide-react";

const EMPTY_MATCH = {
  id: "",
  match_date: "",
  match_time: "18:00",
  home_team_id: "",
  away_team_id: "",
  home_score: 0,
  away_score: 0,
  status: "a_venir" as MatchStatus,
  man_of_the_match_id: "",
};

export default function AdminMatchsPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState(EMPTY_MATCH);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Formulaires d'événements
  const [goalForm, setGoalForm] = useState({ scorer_id: "", assist_id: "", team_id: "", minute: "" });
  const [sanctionForm, setSanctionForm] = useState({ player_id: "", type: "suspension_2min", minute: "" });

  async function loadData() {
    const [{ data: t }, { data: p }, { data: m }] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*").order("jersey_number"),
      supabase.from("matches").select("*").order("match_date", { ascending: false }),
    ]);
    setTeams(t ?? []);
    setPlayers(p ?? []);
    setMatches(m ?? []);
    if (t && t.length >= 2 && !form.home_team_id) {
      setForm((f) => ({ ...f, home_team_id: t[0].id, away_team_id: t[1].id }));
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmitMatch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      match_date: form.match_date,
      match_time: form.match_time,
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      home_score: Number(form.home_score),
      away_score: Number(form.away_score),
      status: form.status,
      man_of_the_match_id: form.man_of_the_match_id || null,
    };
    const { error } = editing
      ? await supabase.from("matches").update(payload).eq("id", form.id)
      : await supabase.from("matches").insert(payload);
    setLoading(false);
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success(editing ? "Match mis à jour." : "Match créé.");
    setForm({ ...EMPTY_MATCH, home_team_id: teams[0]?.id ?? "", away_team_id: teams[1]?.id ?? "" });
    setEditing(false);
    loadData();
  }

  async function handleDeleteMatch(id: string) {
    if (!confirm("Supprimer ce match et tous ses événements ?")) return;
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success("Match supprimé.");
    loadData();
  }

  function startEdit(m: Match) {
    setForm({
      id: m.id,
      match_date: m.match_date,
      match_time: m.match_time,
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      home_score: m.home_score,
      away_score: m.away_score,
      status: m.status,
      man_of_the_match_id: m.man_of_the_match_id ?? "",
    });
    setEditing(true);
  }

  async function addGoal(matchId: string) {
    if (!goalForm.scorer_id || !goalForm.team_id) return toast.error("Sélectionne buteur et équipe.");
    const { error } = await supabase.from("goals").insert({
      match_id: matchId,
      scorer_id: goalForm.scorer_id,
      assist_id: goalForm.assist_id || null,
      team_id: goalForm.team_id,
      minute: goalForm.minute ? Number(goalForm.minute) : null,
    });
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success("But enregistré. Pense à mettre à jour le score du match.");
    setGoalForm({ scorer_id: "", assist_id: "", team_id: "", minute: "" });
  }

  async function addSanction(matchId: string) {
    if (!sanctionForm.player_id) return toast.error("Sélectionne un joueur.");
    const { error } = await supabase.from("sanctions").insert({
      match_id: matchId,
      player_id: sanctionForm.player_id,
      type: sanctionForm.type,
      minute: sanctionForm.minute ? Number(sanctionForm.minute) : null,
    });
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success("Sanction enregistrée.");
    setSanctionForm({ player_id: "", type: "suspension_2min", minute: "" });
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Gestion des matchs</h1>

      <form onSubmit={handleSubmitMatch} className="card p-5 grid sm:grid-cols-2 gap-3">
        <input
          type="date"
          value={form.match_date}
          onChange={(e) => setForm({ ...form, match_date: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
          required
        />
        <input
          type="time"
          value={form.match_time}
          onChange={(e) => setForm({ ...form, match_time: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
          required
        />
        <select
          value={form.home_team_id}
          onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name} (domicile)</option>)}
        </select>
        <select
          value={form.away_team_id}
          onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name} (extérieur)</option>)}
        </select>
        <input
          type="number"
          placeholder="Score équipe domicile"
          value={form.home_score}
          onChange={(e) => setForm({ ...form, home_score: Number(e.target.value) })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        />
        <input
          type="number"
          placeholder="Score équipe extérieur"
          value={form.away_score}
          onChange={(e) => setForm({ ...form, away_score: Number(e.target.value) })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MatchStatus })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          <option value="a_venir">À venir</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
        <select
          value={form.man_of_the_match_id}
          onChange={(e) => setForm({ ...form, man_of_the_match_id: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          <option value="">Homme du match (optionnel)</option>
          {players.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-tally text-white rounded-lg py-2 font-medium sm:col-span-2 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> {editing ? "Mettre à jour le match" : "Créer le match"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {teams.find((t) => t.id === m.home_team_id)?.name} {m.home_score} - {m.away_score}{" "}
                  {teams.find((t) => t.id === m.away_team_id)?.name}
                </p>
                <p className="text-xs text-foreground/60">{m.match_date} · {m.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-muted"><Pencil size={16} /></button>
                <button onClick={() => handleDeleteMatch(m.id)} className="p-2 rounded-lg hover:bg-muted text-red-600"><Trash2 size={16} /></button>
                <button
                  onClick={() => setSelectedMatch(selectedMatch === m.id ? null : m.id)}
                  className="text-xs px-3 py-2 rounded-lg bg-muted"
                >
                  Événements
                </button>
              </div>
            </div>

            {selectedMatch === m.id && (
              <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm mb-2 flex items-center gap-1"><Goal size={14} /> Ajouter un but</p>
                  <div className="flex flex-col gap-2">
                    <select value={goalForm.team_id} onChange={(e) => setGoalForm({ ...goalForm, team_id: e.target.value })} className="border border-border rounded-lg px-2 py-1.5 bg-background text-sm">
                      <option value="">Équipe</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select value={goalForm.scorer_id} onChange={(e) => setGoalForm({ ...goalForm, scorer_id: e.target.value })} className="border border-border rounded-lg px-2 py-1.5 bg-background text-sm">
                      <option value="">Buteur</option>
                      {players.filter((p) => p.team_id === goalForm.team_id).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                    <select value={goalForm.assist_id} onChange={(e) => setGoalForm({ ...goalForm, assist_id: e.target.value })} className="border border-border rounded-lg px-2 py-1.5 bg-background text-sm">
                      <option value="">Passeur (optionnel)</option>
                      {players.filter((p) => p.team_id === goalForm.team_id).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                    <input type="number" placeholder="Minute" value={goalForm.minute} onChange={(e) => setGoalForm({ ...goalForm, minute: e.target.value })} className="border border-border rounded-lg px-2 py-1.5 bg-background text-sm" />
                    <button onClick={() => addGoal(m.id)} className="bg-tally text-white rounded-lg py-1.5 text-sm">Ajouter le but</button>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2 flex items-center gap-1"><ShieldAlert size={14} /> Ajouter une sanction</p>
                  <div className="flex flex-col gap-2">
                    <select value={sanctionForm.player_id} onChange={(e) => setSanctionForm({ ...sanctionForm, player_id: e.target.value })} className="border border-border rounded-lg px-2 py-1.5 bg-background text-sm">
                      <option value="">Joueur</option>
                      {players.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                    <select value={sanctionForm.type} onChange={(e) => setSanctionForm({ ...sanctionForm, type: e.target.value })} className="border border-border rounded-lg px-2 py-1.5 bg-background text-sm">
                      <option value="suspension_2min">Suspension 2 minutes</option>
                      <option value="exclusion_definitive">Exclusion définitive</option>
                    </select>
                    <input type="number" placeholder="Minute" value={sanctionForm.minute} onChange={(e) => setSanctionForm({ ...sanctionForm, minute: e.target.value })} className="border border-border rounded-lg px-2 py-1.5 bg-background text-sm" />
                    <button onClick={() => addSanction(m.id)} className="bg-tally text-white rounded-lg py-1.5 text-sm">Ajouter la sanction</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
