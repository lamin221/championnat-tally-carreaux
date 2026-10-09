import Image from "next/image";
import { Newspaper } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { getNews } from "@/lib/queries";
import { PageHeader, HeaderChip } from "@/components/ui/page-header";
import { Reveal } from "@/components/home/reveal";

export const metadata = { title: "Actualités — Tally Carreaux" };

export default async function ActualitesPage() {
  const news = await getNews();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={Newspaper}
        title="Actualités"
        subtitle="Résumés de matchs, annonces et informations sur les prochaines rencontres."
      >
        <HeaderChip label="Articles" value={news.length} gold />
      </PageHeader>

      {news.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Aucune actualité publiée pour le moment.
        </p>
      ) : (
        <ol className="relative mx-auto w-full max-w-3xl space-y-10 border-l border-border pl-6 sm:pl-10">
          {news.map((item, i) => (
            <li key={item.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-yellow-400 ring-4 ring-background sm:-left-[47px]"
              />
              <Reveal delay={60}>
                <p className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
                  {format(parseISO(item.created_at), "d MMMM yyyy", { locale: fr })}
                </p>
                <article className="card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {item.cover_url && (
                    <div className="relative h-56 overflow-hidden sm:h-72">
                      <Image
                        src={item.cover_url}
                        alt={item.title}
                        width={800}
                        height={400}
                        priority={i === 0}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060b1f]/60 via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="p-5 sm:p-7">
                    <h2 className="font-display text-xl font-semibold leading-snug sm:text-2xl">{item.title}</h2>
                    <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-600" />
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/75 sm:text-base">
                      {item.content}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export const revalidate = 0;
