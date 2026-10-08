import { delay } from "@/lib/anim";
import type { Team } from "@/types/database";

type Resultat = "W" | "D" | "L";
const STYLE: Record<Resultat, { lettre: string; classe: string; titre: string }> = {
  W: { lettre: "V", classe: "bg-emerald-500 shadow-emerald-500/40", titre: "Victoire" },
  D: { lettre: "N", classe: "bg-amber-400 text-amber-950 shadow-amber-400/40", titre: "Match nul" },
  L: { lettre: "D", classe: "bg-red-500 shadow-red-500/40", titre: "Défaite" },
};

/** Forme récente : une pastille par match, qui "pope" quand la section apparaît. */
export function FormGuide({
  rows,
}: {
  rows: { team: Team; form: { match_id: string; result: string }[] }[];
}) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Forme récente</h2>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {(Object.keys(STYLE) as Resultat[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${STYLE[k].classe.split(" ")[0]}`} />
              {STYLE[k].titre}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {rows.map(({ team, form }) => (
          <div key={team.id} className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">{team.name}</span>
            <div className="flex items-center gap-2">
              {form.length === 0 ? (
                <span className="text-xs text-muted-foreground">Pas encore de match</span>
              ) : (
                [...form].reverse().map((f, i) => {
                  const s = STYLE[(f.result as Resultat) in STYLE ? (f.result as Resultat) : "D"];
                  return (
                    <span
                      key={f.match_id}
                      title={s.titre}
                      className={`pop-in grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white shadow-lg ${s.classe}`}
                      style={delay(i * 110)}
                    >
                      {s.lettre}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
