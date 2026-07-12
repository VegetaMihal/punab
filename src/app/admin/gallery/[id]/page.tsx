import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryAlbumForm } from "@/components/admin/GalleryAlbumForm";
import { GalleryImagesManager } from "@/components/admin/GalleryImagesManager";
import { getGalleryAlbumAdmin, listGalleryImagesAdmin } from "@/actions/cms";
import type { GalleryImage } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export default async function EditGalleryAlbumPage({ params }: Props) {
  const { id } = await params;
  const album = await getGalleryAlbumAdmin(id);
  if (!album) {
    notFound();
  }
  const images = await listGalleryImagesAdmin(id);

  return (
    <div>
      <Link href="/admin/gallery" className="text-sm text-accent hover:underline">
        ← Archive
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit album</h1>
      <div className="mt-8 space-y-10">
        <GalleryAlbumForm album={album} />
        <div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Images</h2>
          <p className="mt-1 text-sm text-muted">Upload, caption, set cover and featured flags.</p>
          <div className="mt-4">
            <GalleryImagesManager albumId={id} initialImages={images as GalleryImage[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
