import { cache } from "react";
import { SITE_DEFAULTS, getSetting } from "@/lib/site-defaults";
import type { GalleryAlbum, GalleryImage, PageRow } from "@/types/database";
import {
  getFeaturedHomeAlbums as loadFeaturedHomeAlbums,
  getPublishedAlbumBySlug as loadPublishedAlbumBySlug,
  listPublishedAlbums,
} from "@/lib/repositories/gallery-repository";
import { getPublishedPageBySlug as loadPublishedPageBySlug } from "@/lib/repositories/pages-repository";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";

export type { FeaturedHomeAlbumBlock } from "@/lib/repositories/gallery-repository";

export const getPublicSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    return await getSiteSettingsMap();
  } catch {
    return { ...SITE_DEFAULTS };
  }
});

export function pickSettings(map: Record<string, string>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    out[k] = getSetting(map, k);
  }
  return out;
}

export const getPublishedAlbums = cache(async (): Promise<GalleryAlbum[]> => {
  return listPublishedAlbums();
});

export const getPublishedAlbumBySlug = cache(
  async (slug: string): Promise<{ album: GalleryAlbum | null; images: GalleryImage[] }> => {
    return loadPublishedAlbumBySlug(slug);
  }
);

export const getPublishedPageBySlug = cache(async (slug: string): Promise<PageRow | null> => {
  return loadPublishedPageBySlug(slug);
});

export const getFeaturedHomeAlbums = cache(async () => {
  try {
    return await loadFeaturedHomeAlbums();
  } catch {
    return [];
  }
});
