import { Images } from "lucide-react";
import { getGalleryItems } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/ui/gallery-grid";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";

export const metadata = { title: "Galerie — Tally Carreaux" };

export default async function GaleriePage() {
  const items = await getGalleryItems();
  const supabase = await createClient();

  const withUrls = items.map((item) => {
    const { data } = supabase.storage.from("gallery").getPublicUrl(item.storage_path);
    return { ...item, publicUrl: data.publicUrl };
  });

  const photos = items.filter((i) => i.type === "photo").length;
  const videos = items.length - photos;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        icon={Images}
        title="Galerie"
        subtitle="Les photos et vidéos des moments forts du championnat."
      >
        <HeaderChip label="Photos" value={photos} />
        <HeaderChip label="Vidéos" value={videos} gold />
      </PageHeader>

      {withUrls.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <Images size={40} className="mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun média pour le moment. Les photos et vidéos ajoutées depuis l&apos;espace admin
            apparaîtront ici automatiquement.
          </p>
        </div>
      ) : (
        <GalleryGrid items={withUrls} />
      )}
    </div>
  );
}

export const revalidate = 0;
