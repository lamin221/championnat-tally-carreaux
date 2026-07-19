import Image from "next/image";
import type { Team } from "@/types/database";

export function TeamBadge({
  team,
  size = 32,
  showName = true,
}: {
  team: Pick<Team, "name" | "logo_url" | "primary_color">;
  size?: number;
  showName?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {team.logo_url ? (
        <Image
          src={team.logo_url}
          alt={team.name}
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
          style={{
            width: size,
            height: size,
            backgroundColor: team.primary_color,
            fontSize: size * 0.4,
          }}
        >
          {team.name.charAt(0)}
        </div>
      )}
      {showName && <span className="font-medium">{team.name}</span>}
    </div>
  );
}
