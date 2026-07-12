"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  deleteGalleryImage,
  listGalleryImagesAdmin,
  updateGalleryImage,
  uploadGalleryImages,
} from "@/actions/cms";
import type { GalleryImage } from "@/types/database";

type Props = {
  albumId: string;
  initialImages: GalleryImage[];
};

export function GalleryImagesManager({ albumId, initialImages }: Props) {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [pending, startTransition] = useTransition();
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) {
        return;
      }

      setGalleryUploading(true);
      const fd = new FormData();
      fd.set("albumId", albumId);
      for (const f of accepted) {
        fd.append("files", f);
      }
      const res = await uploadGalleryImages(fd);
      setGalleryUploading(false);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      const next = await listGalleryImagesAdmin(albumId);
      setImages(next as GalleryImage[]);
      router.refresh();
      toast.success(`Uploaded ${accepted.length} image${accepted.length > 1 ? "s" : ""}`);
    },
    [albumId, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    disabled: pending || galleryUploading,
  });

  async function saveField(id: string, patch: Partial<GalleryImage>) {
    startTransition(async () => {
      const res = await updateGalleryImage(id, {
        caption: patch.caption,
        alt_text: patch.alt_text,
        sort_order: patch.sort_order,
        is_featured: patch.is_featured,
        is_cover: patch.is_cover,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Updated");
      router.refresh();
    });
  }

  async function remove(id: string) {
    if (!confirm("Delete this image from storage and the archive?")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteGalleryImage(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Deleted");
      setImages((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed border-stone-300 px-6 py-10 text-center text-sm text-muted dark:border-stone-600 ${
          isDragActive ? "border-brand-red bg-brand-red-muted/30" : ""
        }`}
      >
        <input {...getInputProps()} />
        Drag images here or click to upload (multiple)
      </div>
      {galleryUploading && <p className="text-sm text-muted">Uploading…</p>}

      <ul className="space-y-6">
        {images.map((img) => (
          <li
            key={img.id}
            className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 md:flex-row"
          >
            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg bg-stone-100 md:w-56 dark:bg-stone-800">
              <Image src={img.public_url} alt="" fill className="object-cover" sizes="224px" quality={90} />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <label className="text-xs text-muted">Caption</label>
                <input
                  defaultValue={img.caption ?? ""}
                  className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-950"
                  onBlur={(e) => {
                    if (e.target.value !== (img.caption ?? "")) {
                      saveField(img.id, { caption: e.target.value || null });
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted">Alt text</label>
                <input
                  defaultValue={img.alt_text ?? ""}
                  className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-950"
                  onBlur={(e) => {
                    if (e.target.value !== (img.alt_text ?? "")) {
                      saveField(img.id, { alt_text: e.target.value || null });
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-xs text-muted">Sort</label>
                  <input
                    type="number"
                    defaultValue={img.sort_order}
                    className="mt-0.5 w-20 rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-950"
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (n !== img.sort_order) {
                        saveField(img.id, { sort_order: n });
                      }
                    }}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    defaultChecked={img.is_featured}
                    onChange={(e) => saveField(img.id, { is_featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    defaultChecked={img.is_cover}
                    onChange={(e) => saveField(img.id, { is_cover: e.target.checked })}
                  />
                  Cover
                </label>
              </div>
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {images.length === 0 && <p className="text-sm text-muted">No images yet.</p>}
    </div>
  );
}
