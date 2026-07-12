export const revalidate = 120;

import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedAlbums } from "@/lib/data/site-content";

export const metadata = {
  title: "Archive",
};

export default async function ArchiveIndexPage() {
  const albums = await getPublishedAlbums().catch(() => []);

  return (
    <>
      <PageHeader
        title="Archive"
        description="Photos from programmes, chapters, and national gatherings—published albums only."
      />
      <MarketingContainer className="py-12">
        {albums.length === 0 && (
          <EmptyState title="No albums yet" description="Check back soon for published photo albums." />
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link
              key={a.id}
              href={`/archive/${a.slug}`}
              className="group overflow-hidden rounded-stat border border-stone-200 bg-white shadow-soft motion-safe:transition-shadow motion-safe:duration-200 hover:border-brand-red/30 hover:shadow-soft-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="relative aspect-[4/3] bg-stone-200 dark:bg-stone-800">
                {a.cover_image_url ? (
                  <Image
                    src={a.cover_image_url}
                    alt={a.title}
                    fill
                    className="object-cover motion-safe:transition motion-safe:duration-200 group-hover:opacity-95"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    quality={90}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">No cover</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-stone-900 group-hover:text-brand-red dark:text-stone-50">{a.title}</h2>
                {a.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{a.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </MarketingContainer>
    </>
  );
}
