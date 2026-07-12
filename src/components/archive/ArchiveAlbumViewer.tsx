"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryAlbum, GalleryImage } from "@/types/database";

type Props = {
  album: GalleryAlbum;
  images: GalleryImage[];
};

export function ArchiveAlbumViewer({ album, images }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const total = images.length;
  const isOpen = openIndex !== null;
  const nextIndex = openIndex === null ? null : (openIndex + 1) % total;
  const prevIndex = openIndex === null ? null : (openIndex - 1 + total) % total;

  const closeViewer = useCallback(() => {
    setOpenIndex(null);
  }, []);

  const prevImage = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null || total === 0) return current;
      return (current - 1 + total) % total;
    });
  }, [total]);

  const nextImage = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null || total === 0) return current;
      return (current + 1) % total;
    });
  }, [total]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") prevImage();
      if (event.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeViewer, isOpen, nextImage, prevImage]);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="overflow-hidden rounded-card border border-stone-200 bg-stone-100 text-left shadow-soft transition hover:shadow-soft-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-stone-700 dark:bg-stone-800"
            aria-label={`Open image ${index + 1} of ${total} from ${album.title}`}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={img.public_url}
                alt={img.alt_text || img.caption || album.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
                quality={90}
              />
            </div>
            {img.caption && (
              <div className="border-t border-stone-200 px-2 py-1.5 text-xs text-muted dark:border-stone-700">
                {img.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {isOpen && openIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${album.title} image viewer`}
        >
          <button
            type="button"
            onClick={closeViewer}
            className="absolute inset-0 cursor-default"
            aria-label="Close image viewer backdrop"
          />

          <div className="relative z-[71] w-full max-w-6xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black">
              <Image
                src={images[openIndex].public_url}
                alt={images[openIndex].alt_text || images[openIndex].caption || album.title}
                fill
                className="object-contain"
                sizes="(max-width: 1152px) 100vw, 1152px"
                quality={100}
                priority
              />
            </div>
            {total > 1 && nextIndex !== null && prevIndex !== null && (
              <div className="hidden" aria-hidden>
                <Image
                  src={images[nextIndex].public_url}
                  alt=""
                  width={1}
                  height={1}
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  quality={100}
                  loading="eager"
                />
                {prevIndex !== nextIndex && (
                  <Image
                    src={images[prevIndex].public_url}
                    alt=""
                    width={1}
                    height={1}
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    quality={100}
                    loading="eager"
                  />
                )}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white/90">
              <p className="truncate">
                {images[openIndex].caption || images[openIndex].alt_text || album.title}
              </p>
              <p className="shrink-0">
                {openIndex + 1} / {total}
              </p>
            </div>

            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/50 px-3 py-2 text-2xl leading-none text-white hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/50 px-3 py-2 text-2xl leading-none text-white hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Next image"
            >
              →
            </button>
            <button
              type="button"
              onClick={closeViewer}
              className="absolute right-2 top-2 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-sm font-semibold text-white hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Close image viewer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
