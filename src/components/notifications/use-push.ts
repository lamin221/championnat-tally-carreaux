"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export type EtatPush =
  | "chargement"
  | "indisponible" // navigateur non compatible ou clés non configurées
  | "ios-installer" // iPhone : il faut d'abord installer l'appli sur l'écran d'accueil
  | "bloque" // l'utilisateur a refusé les notifications
  | "inactif"
  | "actif";

function cleVersBytes(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const brut = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const sortie = new Uint8Array(brut.length);
  for (let i = 0; i < brut.length; i++) sortie[i] = brut.charCodeAt(i);
  return sortie;
}

/** Gère l'abonnement du visiteur aux notifications push. */
export function usePush() {
  const [etat, setEtat] = useState<EtatPush>("chargement");
  const [occupe, setOccupe] = useState(false);
  const cle = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    let annule = false;
    (async () => {
      const maj = (e: EtatPush) => !annule && setEtat(e);
      if (!cle) return maj("indisponible");

      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const installee =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      const supporte = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

      if (!supporte) return maj(ios && !installee ? "ios-installer" : "indisponible");
      if (Notification.permission === "denied") return maj("bloque");

      try {
        // Le service worker peut ne jamais être prêt (non enregistré) : on n'attend pas indéfiniment.
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((r) => setTimeout(() => r(null), 4000)),
        ]);
        if (!reg) return maj("indisponible");
        const sub = await reg.pushManager.getSubscription();
        maj(sub ? "actif" : "inactif");
      } catch {
        maj("indisponible");
      }
    })();
    return () => {
      annule = true;
    };
  }, [cle]);

  const activer = useCallback(async () => {
    if (!cle) return;
    setOccupe(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setEtat(permission === "denied" ? "bloque" : "inactif");
        if (permission === "denied") toast.error("Notifications refusées. Tu peux les autoriser dans les réglages du navigateur.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: cleVersBytes(cle) as BufferSource,
      });
      const json = sub.toJSON();
      const supabase = createClient();
      const { error } = await supabase.from("push_subscriptions").insert({
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      });
      // 23505 = déjà enregistré : tout va bien.
      if (error && error.code !== "23505") {
        await sub.unsubscribe();
        throw new Error(error.message);
      }
      setEtat("actif");
      toast.success("Notifications activées : tu seras prévenu des matchs et des buts.");
    } catch (e) {
      toast.error(`Activation impossible : ${e instanceof Error ? e.message : "erreur inconnue"}`);
    } finally {
      setOccupe(false);
    }
  }, [cle]);

  const desactiver = useCallback(async () => {
    setOccupe(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      await sub?.unsubscribe();
      setEtat("inactif");
      toast("Notifications désactivées.");
    } finally {
      setOccupe(false);
    }
  }, []);

  return { etat, occupe, activer, desactiver };
}
