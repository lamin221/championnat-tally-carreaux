"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Download } from "lucide-react";
import type { GalleryItem } from "@/types/database";

type ItemWithUrl = GalleryItem & { publicUrl: string };

export function GalleryGrid({ items }: { items: ItemWithUrl[] }) {
  const [selected, setSelected] = useState<ItemWithUrl | null>(null);

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="break-inside-avoid rounded-2xl overflow-hidden card block w-full text-left"
          >
            {item.type === "photo" ? (
              <Image
                src={item.publicUrl}
                alt={item.caption ?? "Moment du championnat"}
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />
            ) : (
              <video src={item.publicUrl} className="w-full h-auto pointer-events-none" muted />
            )}
            {item.caption && <p className="p-2 text-xs text-foreground/60">{item.caption}</p>}
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <a
              href={selected.publicUrl}
              download
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Télécharger"
            >
              <Download size={20} />
            </a>
            <button
              onClick={() => setSelected(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            {selected.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.publicUrl}
                alt={selected.caption ?? "Moment du championnat"}
                className="w-full h-full max-h-[85vh] object-contain rounded-lg"
              />
            ) : (
              <video src={selected.publicUrl} controls autoPlay className="w-full max-h-[85vh] rounded-lg" />
            )}
            {selected.caption && (
              <p className="text-white/80 text-sm text-center mt-3">{selected.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
