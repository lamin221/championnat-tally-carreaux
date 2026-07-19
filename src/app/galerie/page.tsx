import Image from "next/image";
import { getGalleryItems } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Galerie — Tally Carreaux" };

export default async function GaleriePage() {
  const items = await getGalleryItems();
  const supabase = await createClient();

  const withUrls = items.map((item) => {
    const { data } = supabase.storage.from("gallery").getPublicUrl(item.storage_path);
    return { ...item, publicUrl: data.publicUrl };
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Galerie</h1>
      {withUrls.length === 0 ? (
        <p className="text-foreground/50">
          Aucun média pour le moment. Les photos et vidéos ajoutées depuis l&apos;espace admin
          apparaîtront ici automatiquement.
        </p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {withUrls.map((item) => (
            <div key={item.id} className="break-inside-avoid rounded-2xl overflow-hidden card">
              {item.type === "photo" ? (
                <Image
                  src={item.publicUrl}
                  alt={item.caption ?? "Moment du championnat"}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <video src={item.publicUrl} controls className="w-full h-auto" />
              )}
              {item.caption && <p className="p-2 text-xs text-foreground/60">{item.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const revalidate = 0;
