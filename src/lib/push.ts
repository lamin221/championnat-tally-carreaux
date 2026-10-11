import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PushPayload } from "./push-messages";

/**
 * Envoie une notification à tous les abonnés.
 * Les abonnements expirés (désinstallation, permission retirée) sont supprimés au passage.
 * À appeler avec un client Supabase connecté en administrateur (la liste des abonnés est protégée).
 */
export async function sendPushToAll(supabase: SupabaseClient, payload: PushPayload) {
  const publique = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privee = process.env.VAPID_PRIVATE_KEY;
  if (!publique || !privee) {
    throw new Error("Clés VAPID manquantes : ajoute NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY.");
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:contact@tally-carreaux.sn", publique, privee);

  const { data: abonnes, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");
  if (error) throw new Error(error.message);

  const liste = abonnes ?? [];
  const message = JSON.stringify(payload);

  const resultats = await Promise.allSettled(
    liste.map((a) =>
      webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, message, {
        TTL: 3600,
        urgency: "high",
      })
    )
  );

  const expires: string[] = [];
  let envoyes = 0;
  resultats.forEach((r, i) => {
    if (r.status === "fulfilled") envoyes++;
    else {
      const code = (r.reason as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) expires.push(liste[i].id);
    }
  });

  if (expires.length > 0) await supabase.from("push_subscriptions").delete().in("id", expires);

  return { total: liste.length, sent: envoyes, failed: liste.length - envoyes - expires.length, removed: expires.length };
}
