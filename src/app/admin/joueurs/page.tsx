"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Player, PlayerPosition, Team } from "@/types/database";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, Upload } from "lucide-react";

const POSITIONS: PlayerPosition[] = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

const EMPTY_FORM = {
  id: "",
  team_id: "",
  full_name: "",
  nickname: "",
  jersey_number: 1,
  position: "Milieu" as PlayerPosition,
  photo_url: "" as string | null,
};

export default function AdminJoueursPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*").order("jersey_number"),
    ]);
    setTeams(t ?? []);
    setPlayers(p ?? []);
    if (t && t[0] && !form.team_id) setForm((f) => ({ ...f, team_id: t[0].id }));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload la photo choisie vers le bucket "player-photos" et renvoie son URL publique
  async function uploadPhotoIfNeeded(): Promise<string | null> {
    if (!photoFile) return form.photo_url || null;

    const path = `${Date.now()}-${photoFile.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await supabase.storage
      .from("player-photos")
      .upload(path, photoFile);

    if (uploadError) {
      toast.error(`Erreur d'upload photo : ${uploadError.message}`);
      return form.photo_url || null;
    }

    const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const photo_url = await uploadPhotoIfNeeded();

    const payload = {
      team_id: form.team_id,
      full_name: form.full_name,
      nickname: form.nickname || null,
      jersey_number: Number(form.jersey_number),
      position: form.position,
      photo_url: photo_url || null,
    };

    const { error } = editing
      ? await supabase.from("players").update(payload).eq("id", form.id)
      : await supabase.from("players").insert(payload);

    setLoading(false);

    if (error) {
      toast.error(`Erreur : ${error.message}`);
      return;
    }
    toast.success(editing ? "Joueur mis à jour." : "Joueur ajouté.");
    setForm({ ...EMPTY_FORM, team_id: teams[0]?.id ?? "" });
    setPhotoFile(null);
    setEditing(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce joueur ? Cette action est irréversible.")) return;
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      toast.error(`Erreur : ${error.message}`);
      return;
    }
    toast.success("Joueur supprimé.");
    loadData();
  }

  function startEdit(p: Player) {
    setForm({
      id: p.id,
      team_id: p.team_id,
      full_name: p.full_name,
      nickname: p.nickname ?? "",
      jersey_number: p.jersey_number,
      position: p.position,
      photo_url: p.photo_url,
    });
    setPhotoFile(null);
    setEditing(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Gestion des joueurs</h1>

      <form onSubmit={handleSubmit} className="card p-5 grid sm:grid-cols-2 gap-3">
        <select
          value={form.team_id}
          onChange={(e) => setForm({ ...form, team_id: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
          required
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input
          placeholder="Nom complet"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
          required
        />
        <input
          placeholder="Surnom (optionnel)"
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        />
        <input
          type="number"
          min={1}
          max={99}
          placeholder="Numéro"
          value={form.jersey_number}
          onChange={(e) => setForm({ ...form, jersey_number: Number(e.target.value) })}
          className="border border-border rounded-lg px-3 py-2 bg-background"
          required
        />
        <select
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value as PlayerPosition })}
          className="border border-border rounded-lg px-3 py-2 bg-background sm:col-span-2"
        >
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>

        <div className="sm:col-span-2 flex items-center gap-3">
          {form.photo_url && !photoFile && (
            <Image
              src={form.photo_url}
              alt="Photo actuelle"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <label className="text-xs text-foreground/60 block mb-1">
              Photo du joueur (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="text-sm w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-tally text-white rounded-lg py-2 font-medium sm:col-span-2 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Upload size={16} className="animate-pulse" /> : <Plus size={16} />}
          {loading ? "Enregistrement..." : editing ? "Mettre à jour" : "Ajouter le joueur"}
        </button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.map((p) => (
          <div key={p.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {p.photo_url ? (
                <Image
                  src={p.photo_url}
                  alt={p.full_name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {p.jersey_number}
                </div>
              )}
              <div>
                <p className="font-medium">#{p.jersey_number} {p.full_name}</p>
                <p className="text-xs text-foreground/60">{p.position}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-muted">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-muted text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
