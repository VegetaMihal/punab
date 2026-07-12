import Link from "next/link";
import { listGalleryAlbumsAdmin } from "@/actions/cms";
import { DeleteGalleryAlbumButton } from "@/components/admin/DeleteGalleryAlbumButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Archive",
};

export default async function AdminGalleryPage() {
  const albums = await listGalleryAlbumsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Archive</h1>
          <p className="mt-1 text-sm text-muted">Albums and images for the public archive and homepage feature.</p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New album
        </Link>
      </div>
      <div className="mt-8 space-y-3">
        {albums.length === 0 && (
          <EmptyState title="No albums" description="Create an album, then add images." />
        )}
        {albums.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
          >
            <div>
              <Link
                href={`/admin/gallery/${a.id}`}
                className="font-medium text-stone-900 hover:underline dark:text-stone-50"
              >
                {a.title}
              </Link>
              <p className="text-xs text-muted">
                /archive/{a.slug} · {a.is_published ? "Published" : "Draft"}
                {a.featured_on_home ? " · Featured on home" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/archive/${a.slug}`} className="text-sm text-accent hover:underline" target="_blank">
                View
              </Link>
              <DeleteGalleryAlbumButton id={a.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
