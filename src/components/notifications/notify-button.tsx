"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { usePush } from "./use-push";

/** Cloche de la barre de navigation : active ou coupe les notifications. */
export function NotifyButton() {
  const { etat, occupe, activer, desactiver } = usePush();
  if (etat === "chargement" || etat === "indisponible") return null;

  function clic() {
    if (etat === "ios-installer") {
      return toast("Sur iPhone : touche Partager puis « Sur l'écran d'accueil », ouvre l'appli et reviens ici.", {
        duration: 8000,
      });
    }
    if (etat === "bloque") {
      return toast.error("Notifications bloquées : autorise-les dans les réglages de ton navigateur.");
    }
    return etat === "actif" ? desactiver() : activer();
  }

  const label =
    etat === "actif" ? "Désactiver les notifications" : "Activer les notifications des matchs";

  return (
    <button
      onClick={clic}
      disabled={occupe}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-lg text-foreground/70 transition hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      {etat === "actif" ? (
        <BellRing size={19} className="text-yellow-500" />
      ) : etat === "bloque" ? (
        <BellOff size={19} />
      ) : (
        <Bell size={19} />
      )}
    </button>
  );
}
