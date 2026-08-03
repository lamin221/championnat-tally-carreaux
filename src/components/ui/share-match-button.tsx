"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareMatchButton({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // L'utilisateur a annulé le partage, rien à faire.
      }
      return;
    }

    // Pas de partage natif disponible (ordinateur, navigateur non compatible) :
    // on ouvre directement WhatsApp Web avec le message pré-rempli.
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Ouverture de WhatsApp...");
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-muted hover:bg-border transition-colors"
    >
      <Share2 size={16} /> Partager
    </button>
  );
}
