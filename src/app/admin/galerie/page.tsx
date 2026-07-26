"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GalleryItem } from "@/types/database";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

export default function AdminGaleriePage() {
  const supabase = createClient();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  async function loadData() {
    const { data } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return toast.error("Sélectionne au moins un fichier.");
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let successCount = 0;

    // Upload séquentiel : un fichier à la fois, pour rester fiable même
    // avec une connexion lente et beaucoup de fichiers sélectionnés d'un coup.
    for (const file of files) {
      const type = file.type.startsWith("video") ? "video" : "photo";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/\s+/g, "-")}`;

      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) {
        toast.error(`Échec pour "${file.name}" : ${uploadError.message}`);
      } else {
        const { error } = await supabase.from("gallery_items").insert({
          type,
          storage_path: path,
          caption: caption || null,
          uploaded_by: user?.id ?? null,
        });
        if (error) {
          toast.error(`Échec enregistrement pour "${file.name}" : ${error.message}`);
        } else {
          successCount++;
        }
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} média${successCount > 1 ? "s" : ""} ajouté${successCount > 1 ? "s" : ""} à la galerie.`);
    }
    setCaption("");
    setFiles([]);
    loadData();
  }

  async function handleDelete(item: GalleryItem) {
    if (!confirm("Supprimer ce média ?")) return;
    await supabase.storage.from("gallery").remove([item.storage_path]);
    const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success("Média supprimé.");
    loadData();
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Gestion de la galerie</h1>

      <form onSubmit={handleUpload} className="card p-5 flex flex-col gap-3">
        <div>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            className="text-sm"
          />
          {files.length > 0 && (
            <p className="text-xs text-foreground/60 mt-1">
              {files.length} fichier{files.length > 1 ? "s" : ""} sélectionné{files.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <input
          placeholder="Légende (optionnel, appliquée à tous les fichiers sélectionnés)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-tally text-white rounded-lg py-2 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Upload size={16} />
          {uploading ? `Envoi... (${progress.done}/${progress.total})` : "Importer"}
        </button>
      </form>

      <div className="grid sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.id} className="card p-3 flex items-center justify-between">
            <span className="text-sm truncate">{item.storage_path}</span>
            <button onClick={() => handleDelete(item)} className="p-2 rounded-lg hover:bg-muted text-red-600 shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
