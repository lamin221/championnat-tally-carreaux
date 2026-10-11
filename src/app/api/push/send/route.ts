import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildMessage, type PushType } from "@/lib/push-messages";
import { sendPushToAll } from "@/lib/push";

export const dynamic = "force-dynamic";

const TYPES: PushType[] = ["kickoff", "goal", "final"];

/** Envoie une notification (coup d'envoi, but, fin de match). Réservé aux administrateurs. */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { data: profil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profil?.role !== "admin") return NextResponse.json({ error: "Réservé à l'administrateur." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as {
    type?: PushType;
    matchId?: string;
    goalId?: string;
    homeScore?: number;
    awayScore?: number;
    motmId?: string;
  } | null;

  if (!body?.type || !TYPES.includes(body.type) || !body.matchId) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { data: match } = await supabase.from("matches").select("*").eq("id", body.matchId).single();
  if (!match) return NextResponse.json({ error: "Match introuvable." }, { status: 404 });

  const { data: equipes } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", [match.home_team_id, match.away_team_id]);
  const home = equipes?.find((t) => t.id === match.home_team_id)?.name ?? "Équipe A";
  const away = equipes?.find((t) => t.id === match.away_team_id)?.name ?? "Équipe B";

  // Le score est transmis par la saisie rapide (la base peut ne pas être encore à jour) ; sinon on lit la base.
  const homeScore = Number(body.homeScore ?? match.home_score ?? 0);
  const awayScore = Number(body.awayScore ?? match.away_score ?? 0);

  let scorer: string | null = null;
  let minute: number | null = null;
  let ownGoal = false;
  if (body.type === "goal" && body.goalId) {
    const { data: but } = await supabase.from("goals").select("*").eq("id", body.goalId).single();
    if (but) {
      minute = but.minute;
      ownGoal = but.is_own_goal;
      const { data: joueur } = await supabase
        .from("players")
        .select("full_name, nickname")
        .eq("id", but.scorer_id)
        .single();
      scorer = joueur ? joueur.nickname || joueur.full_name : null;
    }
  }

  let motm: string | null = null;
  if (body.type === "final" && body.motmId) {
    const { data: joueur } = await supabase
      .from("players")
      .select("full_name, nickname")
      .eq("id", body.motmId)
      .single();
    motm = joueur ? joueur.nickname || joueur.full_name : null;
  }

  const message = buildMessage({
    type: body.type,
    matchId: match.id,
    home,
    away,
    homeScore,
    awayScore,
    scorer,
    minute,
    ownGoal,
    motm,
  });

  try {
    const resultat = await sendPushToAll(supabase, message);
    return NextResponse.json(resultat);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Envoi impossible." }, { status: 500 });
  }
}
