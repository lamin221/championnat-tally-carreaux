import { getGalleryItems } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/ui/gallery-grid";

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
        <GalleryGrid items={withUrls} />
      )}
    </div>
  );
}

export const revalidate = 0;
