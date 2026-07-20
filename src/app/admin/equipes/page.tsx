"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Team } from "@/types/database";
import { toast } from "sonner";
import { Upload, Save } from "lucide-react";

export default function AdminEquipesPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<Team>>>({});
  const [photoFiles, setPhotoFiles] = useState<Record<string, File | null>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadData() {
    const { data } = await supabase.from("teams").select("*").order("name");
    setTeams(data ?? []);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDraft(teamId: string, field: keyof Team, value: string) {
    setDrafts((d) => ({ ...d, [teamId]: { ...d[teamId], [field]: value } }));
  }

  async function handleSave(team: Team) {
    setSavingId(team.id);
    const draft = drafts[team.id] ?? {};
    const file = photoFiles[team.id];

    let logo_url = team.logo_url;
    if (file) {
      const path = `${team.id}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("team-logos").upload(path, file);
      if (uploadError) {
        setSavingId(null);
        return toast.error(`Erreur d'upload : ${uploadError.message}`);
      }
      const { data } = supabase.storage.from("team-logos").getPublicUrl(path);
      logo_url = data.publicUrl;
    }

    const { error } = await supabase
      .from("teams")
      .update({
        name: draft.name ?? team.name,
        primary_color: draft.primary_color ?? team.primary_color,
        secondary_color: draft.secondary_color ?? team.secondary_color,
        logo_url,
      })
      .eq("id", team.id);

    setSavingId(null);

    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success(`${draft.name ?? team.name} mise à jour.`);
    setPhotoFiles((f) => ({ ...f, [team.id]: null }));
    loadData();
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Gestion des équipes</h1>
      <p className="text-sm text-foreground/60">
        Modifie le nom, les couleurs et le logo de chaque équipe. Les changements s&apos;appliquent
        immédiatement sur tout le site après enregistrement.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {teams.map((team) => {
          const draft = drafts[team.id] ?? {};
          const preview = photoFiles[team.id]
            ? URL.createObjectURL(photoFiles[team.id]!)
            : team.logo_url;

          return (
            <div key={team.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                {preview ? (
                  <Image
                    src={preview}
                    alt={team.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                    unoptimized={!!photoFiles[team.id]}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: draft.primary_color ?? team.primary_color }}
                  >
                    {(draft.name ?? team.name).charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <label className="text-xs text-foreground/60 block mb-1">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPhotoFiles((f) => ({ ...f, [team.id]: e.target.files?.[0] ?? null }))
                    }
                    className="text-sm w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-foreground/60 block mb-1">Nom de l&apos;équipe</label>
                <input
                  defaultValue={team.name}
                  onChange={(e) => updateDraft(team.id, "name", e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 bg-background w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">Couleur principale</label>
                  <input
                    type="color"
                    defaultValue={team.primary_color}
                    onChange={(e) => updateDraft(team.id, "primary_color", e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">Couleur secondaire</label>
                  <input
                    type="color"
                    defaultValue={team.secondary_color ?? "#FFFFFF"}
                    onChange={(e) => updateDraft(team.id, "secondary_color", e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSave(team)}
                disabled={savingId === team.id}
                className="bg-tally text-white rounded-lg py-2 font-medium flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {savingId === team.id ? (
                  <Upload size={16} className="animate-pulse" />
                ) : (
                  <Save size={16} />
                )}
                {savingId === team.id ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
