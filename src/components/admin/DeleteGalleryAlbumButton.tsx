"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteGalleryAlbum } from "@/actions/cms";

export function DeleteGalleryAlbumButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this album and all its images?")) {
          return;
        }
        startTransition(async () => {
          const res = await deleteGalleryAlbum(id);
          if (res.error) {
            toast.error(res.error);
            return;
          }
          toast.success("Album deleted");
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
