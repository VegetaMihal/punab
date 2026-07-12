import Link from "next/link";
import { GalleryAlbumForm } from "@/components/admin/GalleryAlbumForm";

export const metadata = {
  title: "New archive album",
};

export default function NewGalleryAlbumPage() {
  return (
    <div>
      <Link href="/admin/gallery" className="text-sm text-accent hover:underline">
        ← Archive
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New album</h1>
      <div className="mt-8">
        <GalleryAlbumForm />
      </div>
    </div>
  );
}
