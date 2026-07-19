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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
    if (!file) return toast.error("Sélectionne un fichier.");
    setUploading(true);

    const type = file.type.startsWith("video") ? "video" : "photo";
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
    if (uploadError) {
      setUploading(false);
      return toast.error(`Erreur d'upload : ${uploadError.message}`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("gallery_items").insert({
      type,
      storage_path: path,
      caption: caption || null,
      uploaded_by: user?.id ?? null,
    });

    setUploading(false);
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success("Média ajouté à la galerie.");
    setCaption("");
    setFile(null);
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
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <input
          placeholder="Légende (optionnel)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-tally text-white rounded-lg py-2 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Upload size={16} /> {uploading ? "Envoi..." : "Importer"}
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
