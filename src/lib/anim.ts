import type { CSSProperties } from "react";

/** Décalage d'animation (en ms) transmis aux classes CSS via la variable --d. */
export function delay(ms: number): CSSProperties {
  return { ["--d" as string]: `${ms}ms` } as CSSProperties;
}
