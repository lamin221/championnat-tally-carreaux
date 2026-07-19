"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NewsItem } from "@/types/database";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export default function AdminActualitesPage() {
  const supabase = createClient();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setNews(data ?? []);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("news").insert({
      title,
      content,
      published: true,
      author_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success("Actualité publiée.");
    setTitle("");
    setContent("");
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette actualité ?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success("Actualité supprimée.");
    loadData();
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Gestion des actualités</h1>

      <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-3">
        <input
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
          required
        />
        <textarea
          placeholder="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="border border-border rounded-lg px-3 py-2 bg-background"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-tally text-white rounded-lg py-2 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Publier
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {news.map((n) => (
          <div key={n.id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="text-xs text-foreground/60 line-clamp-1">{n.content}</p>
            </div>
            <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-muted text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
