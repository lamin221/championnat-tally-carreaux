"use client";

import { useEffect, useRef, useState } from "react";

/** Affiche un score ; quand il change (but !), le chiffre grossit et brille. */
export function LiveNumber({ value, className = "" }: { value: number; className?: string }) {
  const precedent = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (precedent.current === value) return;
    precedent.current = value;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1800);
    return () => clearTimeout(t);
  }, [value]);

  return <span className={`inline-block ${flash ? "animate-goal" : ""} ${className}`}>{value}</span>;
}
