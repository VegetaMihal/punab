"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertGalleryAlbum, type CmsResult } from "@/actions/cms";
import type { GalleryAlbum } from "@/types/database";
import { Card } from "@/components/ui/Card";

const initial: CmsResult = {};

type Props = {
  album?: GalleryAlbum | null;
};

export function GalleryAlbumForm({ album }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(upsertGalleryAlbum, initial);

  useEffect(() => {
    if (state?.success) {
      toast.success("Album saved");
      if (!album?.id && state.id) {
        router.push(`/admin/gallery/${state.id}`);
        router.refresh();
      } else if (!album?.id) {
        router.push("/admin/gallery");
        router.refresh();
      }
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, album?.id, router]);

  return (
    <Card className="max-w-xl p-6">
      <form action={formAction} className="space-y-4">
        {album?.id && <input type="hidden" name="id" value={album.id} />}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            required
            defaultValue={album?.title ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug (optional)</label>
          <input
            name="slug"
            defaultValue={album?.slug ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
            placeholder="auto from title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={album?.description ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sort order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={album?.sort_order ?? 0}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              value="true"
              defaultChecked={album?.is_published ?? false}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featuredOnHome"
              value="true"
              defaultChecked={album?.featured_on_home ?? false}
            />
            Feature on homepage
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : album?.id ? "Update album" : "Create album"}
        </button>
      </form>
    </Card>
  );
}
