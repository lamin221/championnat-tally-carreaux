import Image from "next/image";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { getNews } from "@/lib/queries";

export const metadata = { title: "Actualités — Tally Carreaux" };

export default async function ActualitesPage() {
  const news = await getNews();

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Actualités</h1>
      {news.length === 0 ? (
        <p className="text-foreground/50">Aucune actualité publiée pour le moment.</p>
      ) : (
        news.map((item) => (
          <article key={item.id} className="card overflow-hidden">
            {item.cover_url && (
              <Image
                src={item.cover_url}
                alt={item.title}
                width={800}
                height={400}
                className="w-full h-56 object-cover"
              />
            )}
            <div className="p-5">
              <p className="text-xs text-foreground/50">
                {format(parseISO(item.created_at), "d MMMM yyyy", { locale: fr })}
              </p>
              <h2 className="font-semibold text-lg mt-1">{item.title}</h2>
              <p className="text-sm text-foreground/70 mt-2 whitespace-pre-line">{item.content}</p>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

export const revalidate = 0;
