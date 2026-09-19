export const revalidate = 120;

import Image from "next/image";
import { InView } from "@/components/home/InView";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedAlbums } from "@/lib/data/site-content";

export const metadata = {
  title: "Archive",
};

const TILT = ["-rotate-1", "rotate-1", "rotate-2", "-rotate-2"];

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
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a, i) => (
            <li key={a.id}>
              <InView variant="paste" delay={(i % 3) * 120}>
                <Link
                  href={`/archive/${a.slug}`}
                  className={`wall-sheet wall-text group block p-3 pb-5 outline-none ${TILT[i % TILT.length]}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#cfc9ba]">
                    {a.cover_image_url ? (
                      <Image
                        src={a.cover_image_url}
                        alt={a.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        quality={90}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-[#5a564a]">No cover</div>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl leading-tight text-[#1b1a17]">{a.title}</h2>
                  {a.description && <p className="mt-1 line-clamp-2 text-sm text-[#3a382f]">{a.description}</p>}
                </Link>
              </InView>
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </>
  );
}
