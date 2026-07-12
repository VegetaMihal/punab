"use server";

import { assertFullAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import {
  getGalleryAlbumAdmin as repoGetGalleryAlbumAdmin,
  getMaxGalleryImageSortOrder,
  listGalleryAlbumsAdmin as repoListGalleryAlbumsAdmin,
  listGalleryImagesAdmin as repoListGalleryImagesAdmin,
  upsertSiteSettings,
} from "@/lib/repositories";
import {
  getPageAdmin as repoGetPageAdmin,
  listPagesAdmin as repoListPagesAdmin,
} from "@/lib/repositories/pages-repository";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { GalleryAlbum, PageRow } from "@/types/database";
import {
  ensureSupabasePublicObjectUrl,
  getGalleryBucket,
  getLeadershipBucket,
  sanitizeStorageFileName,
} from "@/lib/storage";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CmsResult = { success?: boolean; error?: string; id?: string };

export async function saveSiteSettings(entries: Record<string, string>): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    await upsertSiteSettings(entries);
    revalidatePath("/", "layout");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/join");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save" };
  }
}

export async function uploadSiteAsset(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const { user } = await assertFullAdmin();
    const storage = createServiceRoleSupabase();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No file" };
    }
    const path = `hero/${user.id}/${Date.now()}-${sanitizeStorageFileName(file.name)}`;
    const { error: upErr } = await storage.storage.from("site-assets").upload(path, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
      cacheControl: "31536000",
    });
    if (upErr) {
      return { error: upErr.message };
    }
    const { data: pub } = storage.storage.from("site-assets").getPublicUrl(path);
    return { url: ensureSupabasePublicObjectUrl(pub.publicUrl) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadLeadershipPhoto(
  formData: FormData
): Promise<{ url?: string; error?: string; storagePath?: string }> {
  try {
    await assertFullAdmin();
    const storage = createServiceRoleSupabase();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No file" };
    }
    const memberId = formData.get("memberId")?.toString().trim() || "";
    const prevPath = formData.get("prevStoragePath")?.toString().trim() || "";
    const bucket = getLeadershipBucket();
    const safeName = sanitizeStorageFileName(file.name);
    const folder = memberId ? `leadership/${memberId}` : "leadership/temp";
    const storagePath = `${folder}/${Date.now()}-${safeName}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(storagePath, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
      cacheControl: "31536000",
    });
    if (upErr) {
      const msg = upErr.message.toLowerCase().includes("bucket not found")
        ? `Storage bucket "${bucket}" not found. Create it in Supabase.`
        : upErr.message;
      return { error: msg };
    }
    const { data: pub } = storage.storage.from(bucket).getPublicUrl(storagePath);
    const url = ensureSupabasePublicObjectUrl(pub.publicUrl);
    const canRemovePrev =
      prevPath &&
      prevPath !== storagePath &&
      !prevPath.includes("..") &&
      (prevPath.startsWith("leadership/") || prevPath.startsWith("forum-members/"));
    if (canRemovePrev) {
      await storage.storage.from(bucket).remove([prevPath]);
    }
    return { url, storagePath };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadForumMemberPhoto(
  formData: FormData
): Promise<{ url?: string; error?: string; storagePath?: string }> {
  try {
    await assertFullAdmin();
    const storage = createServiceRoleSupabase();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No file" };
    }
    const forumId = formData.get("forumId")?.toString().trim() || "";
    const memberId = formData.get("memberId")?.toString().trim() || "";
    const prevPath = formData.get("prevStoragePath")?.toString().trim() || "";
    const bucket = getLeadershipBucket();
    const safeName = sanitizeStorageFileName(file.name);
    const folder = memberId ? `forum-members/${memberId}` : `forum-members/temp/${forumId || "unknown"}`;
    const storagePath = `${folder}/${Date.now()}-${safeName}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(storagePath, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
      cacheControl: "31536000",
    });
    if (upErr) {
      const msg = upErr.message.toLowerCase().includes("bucket not found")
        ? `Storage bucket "${bucket}" not found. Create it in Supabase.`
        : upErr.message;
      return { error: msg };
    }
    const { data: pub } = storage.storage.from(bucket).getPublicUrl(storagePath);
    const url = ensureSupabasePublicObjectUrl(pub.publicUrl);
    const canRemovePrev =
      prevPath &&
      prevPath !== storagePath &&
      !prevPath.includes("..") &&
      prevPath.startsWith("forum-members/");
    if (canRemovePrev) {
      await storage.storage.from(bucket).remove([prevPath]);
    }
    return { url, storagePath };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadEventBanner(
  formData: FormData
): Promise<{ url?: string; error?: string; storagePath?: string }> {
  try {
    const { user } = await assertFullAdmin();
    const storage = createServiceRoleSupabase();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No file" };
    }
    const eventId = formData.get("eventId")?.toString().trim() || "";
    const prevPath = formData.get("prevStoragePath")?.toString().trim() || "";
    const bucket = getGalleryBucket();
    const safeName = sanitizeStorageFileName(file.name);
    const folder = eventId ? `event-banners/${eventId}` : `event-banners/temp/${user.id}`;
    const storagePath = `${folder}/${Date.now()}-${safeName}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(storagePath, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
      cacheControl: "31536000",
    });
    if (upErr) {
      const msg = upErr.message.toLowerCase().includes("bucket not found")
        ? `Storage bucket "${bucket}" not found. Create it in Supabase Storage.`
        : upErr.message;
      return { error: msg };
    }
    const { data: pub } = storage.storage.from(bucket).getPublicUrl(storagePath);
    const url = ensureSupabasePublicObjectUrl(pub.publicUrl);
    const canRemovePrev =
      prevPath &&
      prevPath !== storagePath &&
      !prevPath.includes("..") &&
      prevPath.startsWith("event-banners/");
    if (canRemovePrev) {
      await storage.storage.from(bucket).remove([prevPath]);
    }
    return { url, storagePath };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function listGalleryAlbumsAdmin(): Promise<GalleryAlbum[]> {
  await assertFullAdmin();
  return repoListGalleryAlbumsAdmin();
}

export async function getGalleryAlbumAdmin(id: string): Promise<GalleryAlbum | null> {
  await assertFullAdmin();
  return repoGetGalleryAlbumAdmin(id);
}

export async function upsertGalleryAlbum(
  _prev: CmsResult,
  formData: FormData
): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    const id = formData.get("id")?.toString();
    const title = formData.get("title")?.toString()?.trim();
    if (!title) {
      return { error: "Title required" };
    }
    const slugInput = formData.get("slug")?.toString()?.trim();
    const slug = slugInput && slugInput.length > 0 ? slugify(slugInput) : slugify(title);
    const description = formData.get("description")?.toString() || null;
    const isPublished = formData.get("isPublished") === "true";
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const featuredOnHome = formData.get("featuredOnHome") === "true";

    const data = {
      title,
      slug,
      description,
      is_published: isPublished,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      featured_on_home: featuredOnHome,
    };

    if (id) {
      await prisma.galleryAlbum.update({ where: { id }, data });
      revalidatePath("/admin/gallery");
      revalidatePath("/archive");
      revalidatePath("/");
      return { success: true };
    }
    const created = await prisma.galleryAlbum.create({ data, select: { id: true } });
    revalidatePath("/admin/gallery");
    revalidatePath("/archive");
    revalidatePath("/");
    return { success: true, id: created.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteGalleryAlbum(id: string): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const imgs = await prisma.galleryImage.findMany({
      where: { album_id: id },
      select: { storage_path: true },
    });
    for (const im of imgs) {
      if (im.storage_path) {
        await storage.storage.from(bucket).remove([im.storage_path]);
      }
    }
    await prisma.galleryAlbum.delete({ where: { id } });
    revalidatePath("/admin/gallery");
    revalidatePath("/archive");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function uploadGalleryImages(formData: FormData): Promise<CmsResult> {
  try {
    const albumId = formData.get("albumId")?.toString();
    if (!albumId) {
      return { error: "Missing album" };
    }
    await assertFullAdmin();
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const files = formData.getAll("files") as File[];
    if (!files.length) {
      return { error: "No files" };
    }
    let maxSort = await getMaxGalleryImageSortOrder(albumId);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.size) {
        continue;
      }
      const path = `${albumId}/${Date.now()}-${i}-${sanitizeStorageFileName(file.name)}`;
      const { error: upErr } = await storage.storage.from(bucket).upload(path, file, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
        cacheControl: "31536000",
      });
      if (upErr) {
        const msg = upErr.message.toLowerCase().includes("bucket not found")
          ? `Storage bucket "${bucket}" not found. Create it in Supabase Storage.`
          : upErr.message;
        return { error: msg };
      }
      const { data: pub } = storage.storage.from(bucket).getPublicUrl(path);
      maxSort += 1;
      await prisma.galleryImage.create({
        data: {
          album_id: albumId,
          storage_path: path,
          public_url: ensureSupabasePublicObjectUrl(pub.publicUrl),
          caption: null,
          alt_text: file.name.replace(/\.[^/.]+$/, ""),
          sort_order: maxSort,
          is_featured: false,
          is_cover: false,
        },
      });
    }
    revalidatePath("/admin/gallery");
    revalidatePath("/archive");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function createGalleryImageRecord(input: {
  albumId: string;
  storagePath: string;
  publicUrl: string;
  caption?: string | null;
  altText?: string | null;
  sortOrder?: number;
  isFeatured?: boolean;
}): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    if (!input.albumId || !input.storagePath || !input.publicUrl) {
      return { error: "Missing image metadata" };
    }

    let nextSort = input.sortOrder;
    if (nextSort === undefined || !Number.isFinite(nextSort)) {
      nextSort = (await getMaxGalleryImageSortOrder(input.albumId)) + 1;
    }

    await prisma.galleryImage.create({
      data: {
        album_id: input.albumId,
        storage_path: input.storagePath,
        public_url: ensureSupabasePublicObjectUrl(input.publicUrl),
        caption: input.caption ?? null,
        alt_text: input.altText ?? null,
        sort_order: nextSort,
        is_featured: input.isFeatured ?? false,
        is_cover: false,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/archive");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save image record" };
  }
}

export async function updateGalleryImage(
  id: string,
  fields: {
    caption?: string | null;
    alt_text?: string | null;
    sort_order?: number;
    is_featured?: boolean;
    is_cover?: boolean;
  }
): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    const img = await prisma.galleryImage.findUnique({
      where: { id },
      select: { album_id: true },
    });
    if (!img) {
      return { error: "Not found" };
    }
    if (fields.is_cover) {
      await prisma.galleryImage.updateMany({
        where: { album_id: img.album_id },
        data: { is_cover: false },
      });
    }
    const patch: Prisma.GalleryImageUpdateInput = {};
    if (fields.caption !== undefined) patch.caption = fields.caption;
    if (fields.alt_text !== undefined) patch.alt_text = fields.alt_text;
    if (fields.sort_order !== undefined) patch.sort_order = fields.sort_order;
    if (fields.is_featured !== undefined) patch.is_featured = fields.is_featured;
    if (fields.is_cover !== undefined) patch.is_cover = fields.is_cover;

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: patch,
      select: { public_url: true, album_id: true },
    });
    if (fields.is_cover && updated.public_url) {
      await prisma.galleryAlbum.update({
        where: { id: updated.album_id },
        data: { cover_image_url: updated.public_url },
      });
    }
    revalidatePath("/archive");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteGalleryImage(id: string): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const img = await prisma.galleryImage.findUnique({
      where: { id },
      select: { storage_path: true },
    });
    if (img?.storage_path) {
      await storage.storage.from(bucket).remove([img.storage_path]);
    }
    await prisma.galleryImage.delete({ where: { id } });
    revalidatePath("/archive");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function savePage(
  _prev: CmsResult,
  formData: FormData
): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    const id = formData.get("id")?.toString();
    const title = formData.get("title")?.toString()?.trim();
    const slug = slugify(formData.get("slug")?.toString() || title || "page");
    const body = formData.get("body")?.toString() ?? "";
    const meta = formData.get("metaDescription")?.toString() || null;
    const isPublished = formData.get("isPublished") === "true";
    if (!title) {
      return { error: "Title required" };
    }
    if (id) {
      await prisma.page.update({
        where: { id },
        data: { title, slug, body, meta_description: meta, is_published: isPublished },
      });
    } else {
      const inserted = await prisma.page.create({
        data: { title, slug, body, meta_description: meta, is_published: isPublished },
        select: { id: true },
      });
      revalidatePath("/admin/pages");
      revalidatePath(`/p/${slug}`);
      return { success: true, id: inserted.id };
    }
    revalidatePath("/admin/pages");
    revalidatePath(`/p/${slug}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deletePage(id: string): Promise<CmsResult> {
  try {
    await assertFullAdmin();
    const row = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
    await prisma.page.delete({ where: { id } });
    revalidatePath("/admin/pages");
    if (row?.slug) {
      revalidatePath(`/p/${row.slug}`);
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function listPagesAdmin(): Promise<PageRow[]> {
  await assertFullAdmin();
  return repoListPagesAdmin();
}

export async function getPageAdmin(id: string): Promise<PageRow | null> {
  await assertFullAdmin();
  return repoGetPageAdmin(id);
}

export async function listGalleryImagesAdmin(albumId: string) {
  await assertFullAdmin();
  return repoListGalleryImagesAdmin(albumId);
}

export async function saveSiteSettingsForm(_prev: CmsResult, formData: FormData): Promise<CmsResult> {
  const entries: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("s__")) {
      entries[key.slice(3)] = value.toString();
    }
  }
  return saveSiteSettings(entries);
}
