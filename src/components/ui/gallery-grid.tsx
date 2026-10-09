"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, Download, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { delay } from "@/lib/anim";
import type { GalleryItem } from "@/types/database";

type ItemWithUrl = GalleryItem & { publicUrl: string };

export function GalleryGrid({ items }: { items: ItemWithUrl[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const selected = index === null ? null : items[index];

  const fermer = useCallback(() => setIndex(null), []);
  const suivant = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length]
  );
  const precedent = useCallback(
    () => setIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length]
  );

  // Clavier : Échap pour fermer, flèches pour naviguer ; on bloque le scroll de la page.
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
      if (e.key === "ArrowRight") suivant();
      if (e.key === "ArrowLeft") precedent();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, fermer, suivant, precedent]);

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIndex(i)}
            className="hero-in group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-muted text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={delay(Math.min(i * 60, 600))}
            aria-label={item.caption ?? "Ouvrir le média"}
          >
            {item.type === "photo" ? (
              <Image
                src={item.publicUrl}
                alt={item.caption ?? "Moment du championnat"}
                width={400}
                height={300}
                className="h-auto w-full object-cover transition duration-700 group-hover:scale-110"
              />
            ) : (
              <>
                <video src={item.publicUrl} className="pointer-events-none h-auto w-full" muted preload="metadata" />
                <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-yellow-500 group-hover:text-amber-950">
                  <Play size={22} className="ml-0.5 fill-current" />
                </span>
              </>
            )}
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-[#060b1f]/85 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100">
              {item.caption && <p className="text-xs font-medium text-white">{item.caption}</p>}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex animate-fade-in flex-col items-center justify-center bg-[#060b1f]/95 p-4 backdrop-blur-md"
          onClick={fermer}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute right-4 top-4 flex gap-2">
            <a
              href={selected.publicUrl}
              download
              onClick={(e) => e.stopPropagation()}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Télécharger"
            >
              <Download size={20} />
            </a>
            <button
              onClick={fermer}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); precedent(); }}
                className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-yellow-500 hover:text-amber-950 sm:left-6"
                aria-label="Précédent"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); suivant(); }}
                className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-yellow-500 hover:text-amber-950 sm:right-6"
                aria-label="Suivant"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {selected.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.publicUrl}
                alt={selected.caption ?? "Moment du championnat"}
                className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl"
              />
            ) : (
              <video src={selected.publicUrl} controls autoPlay className="max-h-[80vh] w-full rounded-2xl shadow-2xl" />
            )}
            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-white/70">
              <span>{selected.caption}</span>
              <span className="shrink-0 text-xs text-white/40">
                {(index ?? 0) + 1} / {items.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
