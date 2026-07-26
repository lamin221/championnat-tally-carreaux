"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MatchComment } from "@/types/database";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function CommentsSection({ matchId }: { matchId: string }) {
  const supabase = createClient();
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  async function loadComments() {
    const { data } = await supabase
      .from("match_comments")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false });
    setComments(data ?? []);
    setLoadingList(false);
  }

  useEffect(() => {
    loadComments();

    // Rafraîchit automatiquement quand un nouveau commentaire arrive (Realtime)
    const channel = supabase
      .channel(`match_comments:${matchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_comments", filter: `match_id=eq.${matchId}` },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("match_comments").insert({
      match_id: matchId,
      author_name: authorName.trim().slice(0, 60),
      content: content.trim().slice(0, 500),
    });

    setLoading(false);

    if (error) {
      toast.error("Impossible d'envoyer le commentaire.");
      return;
    }

    setContent("");
    loadComments();
  }

  return (
    <section className="card p-5">
      <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
        <MessageCircle size={18} /> Commentaires {comments.length > 0 && `(${comments.length})`}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-5">
        <input
          placeholder="Ton nom"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={60}
          className="border border-border rounded-lg px-3 py-2 bg-background text-sm"
          required
        />
        <div className="flex gap-2">
          <input
            placeholder="Écris un commentaire..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            className="border border-border rounded-lg px-3 py-2 bg-background text-sm flex-1"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-tally text-white rounded-lg px-4 flex items-center justify-center disabled:opacity-50 shrink-0"
            aria-label="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {loadingList ? (
        <p className="text-sm text-foreground/50">Chargement...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-foreground/50">Aucun commentaire pour l&apos;instant. Sois le premier à réagir !</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="text-sm border-b border-border last:border-0 pb-3 last:pb-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{c.author_name}</span>
                <span className="text-xs text-foreground/50 shrink-0">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-foreground/80 mt-0.5">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
