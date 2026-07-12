import { cache } from "react";
import { toGalleryAlbum, toGalleryImage } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { GalleryAlbum, GalleryImage } from "@/types/database";

export async function listPublishedAlbums(): Promise<GalleryAlbum[]> {
  const rows = await prisma.galleryAlbum.findMany({
    where: { is_published: true },
    orderBy: { sort_order: "asc" },
  });
  return rows.map(toGalleryAlbum);
}

export const getPublishedAlbumBySlug = cache(async (
  slug: string
): Promise<{ album: GalleryAlbum | null; images: GalleryImage[] }> => {
  const row = await prisma.galleryAlbum.findFirst({
    where: { slug, is_published: true },
    include: {
      images: { orderBy: { sort_order: "asc" } },
    },
  });
  if (!row) return { album: null, images: [] };
  const { images, ...albumData } = row;
  return {
    album: toGalleryAlbum(albumData),
    images: images.map(toGalleryImage),
  };
});

export type FeaturedHomeAlbumBlock = {
  album: GalleryAlbum;
  images: GalleryImage[];
};

export async function getFeaturedHomeAlbums(): Promise<FeaturedHomeAlbumBlock[]> {
  const albums = await prisma.galleryAlbum.findMany({
    where: { is_published: true, featured_on_home: true },
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }, { title: "asc" }],
    include: {
      images: { orderBy: { sort_order: "asc" } },
    },
  });
  return albums.map((a) => {
    const { images, ...albumData } = a;
    return {
      album: toGalleryAlbum(albumData),
      images: images.slice(0, 8).map(toGalleryImage),
    };
  });
}

export async function listGalleryAlbumsAdmin(): Promise<GalleryAlbum[]> {
  const rows = await prisma.galleryAlbum.findMany({
    orderBy: { sort_order: "asc" },
  });
  return rows.map(toGalleryAlbum);
}

export async function getGalleryAlbumAdmin(id: string): Promise<GalleryAlbum | null> {
  const row = await prisma.galleryAlbum.findUnique({ where: { id } });
  return row ? toGalleryAlbum(row) : null;
}

export async function listGalleryImagesAdmin(albumId: string): Promise<GalleryImage[]> {
  const rows = await prisma.galleryImage.findMany({
    where: { album_id: albumId },
    orderBy: { sort_order: "asc" },
  });
  return rows.map(toGalleryImage);
}

export async function getMaxGalleryImageSortOrder(albumId: string): Promise<number> {
  const agg = await prisma.galleryImage.aggregate({
    where: { album_id: albumId },
    _max: { sort_order: true },
  });
  return agg._max.sort_order ?? 0;
}
