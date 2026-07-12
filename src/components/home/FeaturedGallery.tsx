"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Reveal } from "@/components/ui/Reveal";
import type { GalleryAlbum, GalleryImage } from "@/types/database";

type Props = {
  album: GalleryAlbum;
  images: GalleryImage[];
  /** When stacked below another featured album, adds a top divider and slightly tighter top spacing. */
  sectionSpacing?: "normal" | "tight";
};

export function FeaturedGallery({ album, images, sectionSpacing = "normal" }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (images.length === 0) {
    return null;
  }

  const visibleImages = images.slice(0, 4);
  const currentQuery = searchParams.toString();
  const returnTo = currentQuery ? `${pathname}?${currentQuery}` : pathname;
  const albumHref = `/archive/${album.slug}?returnTo=${encodeURIComponent(returnTo)}`;

  const sectionClass =
    sectionSpacing === "tight"
      ? "bg-[color:var(--color-surface-2)] py-7"
      : "bg-[color:var(--color-surface-2)] py-7";

  return (
    <section className={sectionClass}>
      <MarketingContainer>
        <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="flex flex-wrap items-end justify-between gap-4 md:block">
            <div>
            <h2 className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
              Archive
            </h2>
            <p className="mt-2 text-2xl font-black leading-tight text-[color:var(--color-text)]">{album.title}</p>
            {album.description && (
              <p className="mt-2 line-clamp-2 text-small text-[color:var(--color-text-muted)]">{album.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              href={albumHref}
              variant="secondary"
              size="sm"
              className="group shrink-0 rounded-[var(--radius-full)] border-[color:color-mix(in_srgb,var(--color-brand)_28%,var(--color-border-strong))] bg-[color:var(--color-surface)] px-4 text-[color:var(--color-brand)] shadow-[var(--shadow-sm)] hover:border-[color:var(--color-brand)] hover:bg-[color:color-mix(in_srgb,var(--color-brand)_8%,var(--color-surface))] hover:no-underline"
            >
              <span>Open archive</span>
              <span className="ml-1 motion-safe:transition-transform motion-safe:duration-[var(--transition-fast)] group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {visibleImages.map((img, index) => (
            <Reveal
              key={img.id}
              staggerIndex={index}
              className={index >= 3 ? "hidden" : ""}
            >
              <Link
                href={albumHref}
                className="group relative block aspect-4/3 overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-surface-3)] shadow-[var(--shadow-sm)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-md)] md:h-full"
              >
                <Image
                  src={img.public_url}
                  alt={img.alt_text || img.caption || "Archive"}
                  fill
                  className="object-cover motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                  sizes="(max-width: 639px) 33vw, (max-width: 1023px) 20vw, 18vw"
                  quality={90}
                />
                {(img.caption || img.alt_text) && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[color:color-mix(in_srgb,var(--color-text)_78%,transparent)] to-transparent p-3 opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--transition-base)] group-hover:opacity-100">
                    <p className="text-small line-clamp-2 font-medium text-[color:var(--color-surface)]">
                      {img.caption || img.alt_text}
                    </p>
                  </div>
                )}
              </Link>
            </Reveal>
          ))}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
