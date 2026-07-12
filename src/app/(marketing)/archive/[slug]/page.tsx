import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveAlbumViewer } from "@/components/archive/ArchiveAlbumViewer";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedAlbumBySlug } from "@/lib/data/site-content";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { album } = await getPublishedAlbumBySlug(slug);
  if (!album) {
    return { title: "Album" };
  }
  return {
    title: album.title,
    description: album.description ?? undefined,
  };
}

export default async function ArchiveAlbumPage({ params, searchParams }: Props) {
  const { slug } = await params;
  await searchParams;
  const { album, images } = await getPublishedAlbumBySlug(slug);
  if (!album) {
    notFound();
  }

  return (
    <>
      <PageHeader title={album.title} description={album.description ?? undefined} />
      <MarketingContainer className="py-10">
        <ArchiveAlbumViewer album={album} images={images} />
        <div className="mt-8 text-center">
          <Link
            href="/archive"
            className="inline-block text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ← All albums
          </Link>
        </div>
      </MarketingContainer>
    </>
  );
}
