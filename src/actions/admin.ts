"use server";

import { assertFullAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { HONORARY_LEADERSHIP_LAYER_SLUG } from "@/lib/leadership-constants";
import {
  chapterSchema,
  eventSchema,
  forumLabelSchema,
  forumMemberSchema,
  forumSchema,
  leadershipLayerSchema,
  leadershipSchema,
  noticeSchema,
  universitySchema,
} from "@/lib/validations/admin";
import { setMembershipStatus as persistMembershipStatus } from "@/lib/repositories/profiles-repository";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MembershipStatus } from "@/types/database";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type AdminActionState = { error?: string; success?: boolean };

export async function setMembershipStatus(profileId: string, status: MembershipStatus) {
  try {
    await assertFullAdmin();
    await persistMembershipStatus(profileId, status);
    revalidatePath("/admin/members");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function upsertNotice(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = noticeSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug")?.toString() || undefined,
    excerpt: formData.get("excerpt")?.toString() || undefined,
    body: formData.get("body"),
    isPublished: formData.get("isPublished") === "true",
    publishedAt: formData.get("publishedAt")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? parsed.error.message };
  }

  const slug =
    parsed.data.slug && parsed.data.slug.length > 0
      ? slugify(parsed.data.slug)
      : slugify(parsed.data.title);

  const data = {
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt ?? null,
    body: parsed.data.body,
    is_published: parsed.data.isPublished,
    published_at: parsed.data.isPublished
      ? parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : new Date()
      : null,
  };

  if (id) {
    await prisma.notice.update({ where: { id }, data });
  } else {
    await prisma.notice.create({ data });
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  return { success: true };
}

export async function deleteNotice(id: string) {
  try {
    await assertFullAdmin();
    await prisma.notice.delete({ where: { id } });
    revalidatePath("/admin/notices");
    revalidatePath("/notices");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertEvent(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    location: formData.get("location")?.toString() || undefined,
    bannerUrl: formData.get("bannerUrl")?.toString() || undefined,
    postUrl: formData.get("postUrl")?.toString() || undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt")?.toString() || undefined,
    isPublished: formData.get("isPublished") === "true",
  });
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      error: fe.postUrl?.[0] ?? fe.title?.[0] ?? parsed.error.message,
    };
  }

  const slug =
    parsed.data.slug && parsed.data.slug.length > 0
      ? slugify(parsed.data.slug)
      : slugify(parsed.data.title);

  const data = {
    title: parsed.data.title,
    slug,
    description: parsed.data.description ?? null,
    location: parsed.data.location ?? null,
    banner_url: parsed.data.bannerUrl ?? null,
    post_url: parsed.data.postUrl ?? null,
    start_at: new Date(parsed.data.startAt),
    end_at: parsed.data.endAt ? new Date(parsed.data.endAt) : null,
    is_published: parsed.data.isPublished,
  };

  if (id) {
    await prisma.event.update({ where: { id }, data });
    revalidatePath(`/events/${id}`);
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  }

  const created = await prisma.event.create({ data });
  revalidatePath(`/events/${created.id}`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect(`/admin/events/${created.id}`);
}

export async function deleteEvent(id: string) {
  try {
    await assertFullAdmin();
    await prisma.event.delete({ where: { id } });
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertLeadership(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = leadershipSchema.safeParse({
    layerId: formData.get("layerId"),
    name: formData.get("name"),
    position: formData.get("position"),
    bio: formData.get("bio")?.toString() || undefined,
    photoUrl: formData.get("photoUrl")?.toString() || "",
    sortOrder: formData.get("sortOrder"),
    isPublished: formData.get("isPublished") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] ?? parsed.error.message };
  }

  const data = {
    layer_id: parsed.data.layerId,
    name: parsed.data.name,
    position: parsed.data.position,
    bio: parsed.data.bio ?? null,
    photo_url: parsed.data.photoUrl || null,
    sort_order: parsed.data.sortOrder,
    is_published: parsed.data.isPublished,
  };

  if (id) {
    await prisma.leadershipMember.update({ where: { id }, data });
  } else {
    await prisma.leadershipMember.create({ data });
  }

  revalidatePath("/admin/leadership");
  revalidatePath("/admin/leadership/layers");
  revalidatePath("/admin/leadership/honorary");
  revalidatePath("/leadership");
  revalidatePath("/leadership/honorary");
  return { success: true };
}

export async function deleteLeadership(id: string) {
  try {
    await assertFullAdmin();
    await prisma.leadershipMember.delete({ where: { id } });
    revalidatePath("/admin/leadership");
    revalidatePath("/admin/leadership/layers");
    revalidatePath("/admin/leadership/honorary");
    revalidatePath("/leadership");
    revalidatePath("/leadership/honorary");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertLeadershipLayer(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = leadershipLayerSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    sortOrder: formData.get("sortOrder"),
    isPublished: formData.get("isPublished") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? parsed.error.message };
  }
  const slug =
    parsed.data.slug && parsed.data.slug.length > 0
      ? slugify(parsed.data.slug)
      : slugify(parsed.data.title);

  const data = {
    title: parsed.data.title,
    slug,
    description: parsed.data.description ?? null,
    sort_order: parsed.data.sortOrder,
    is_published: parsed.data.isPublished,
  };

  if (id) {
    const existing = await prisma.leadershipLayer.findUnique({ where: { id } });
    if (existing?.slug === HONORARY_LEADERSHIP_LAYER_SLUG && slug !== HONORARY_LEADERSHIP_LAYER_SLUG) {
      return { error: "The honorary layer slug cannot be changed." };
    }
    await prisma.leadershipLayer.update({ where: { id }, data });
  } else {
    await prisma.leadershipLayer.create({ data });
  }

  revalidatePath("/admin/leadership/layers");
  revalidatePath("/admin/leadership");
  revalidatePath("/admin/leadership/honorary");
  revalidatePath("/leadership");
  revalidatePath("/leadership/honorary");
  return { success: true };
}

export async function deleteLeadershipLayer(id: string) {
  try {
    await assertFullAdmin();
    const row = await prisma.leadershipLayer.findUnique({ where: { id }, select: { slug: true } });
    if (row?.slug === HONORARY_LEADERSHIP_LAYER_SLUG) {
      return { error: "This reserved layer cannot be deleted. It powers the Honorary Position page." };
    }
    await prisma.leadershipLayer.delete({ where: { id } });
    revalidatePath("/admin/leadership/layers");
    revalidatePath("/admin/leadership");
    revalidatePath("/admin/leadership/honorary");
    revalidatePath("/leadership");
    revalidatePath("/leadership/honorary");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertChapter(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = chapterSchema.safeParse({
    universityId: formData.get("universityId")?.toString() || "",
    title: formData.get("title"),
    description: formData.get("description")?.toString() || undefined,
    contactEmail: formData.get("contactEmail")?.toString() || "",
    memberCount: formData.get("memberCount"),
    isPublished: formData.get("isPublished") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? parsed.error.message };
  }

  const uid =
    parsed.data.universityId && /^[0-9a-f-]{36}$/i.test(parsed.data.universityId)
      ? parsed.data.universityId
      : null;

  const data = {
    university_id: uid,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    contact_email: parsed.data.contactEmail || null,
    member_count: parsed.data.memberCount,
    is_published: parsed.data.isPublished,
  };

  if (id) {
    await prisma.chapter.update({ where: { id }, data });
  } else {
    await prisma.chapter.create({ data });
  }

  revalidatePath("/admin/chapters");
  revalidatePath("/chapters");
  return { success: true };
}

export async function deleteChapter(id: string) {
  try {
    await assertFullAdmin();
    await prisma.chapter.delete({ where: { id } });
    revalidatePath("/admin/chapters");
    revalidatePath("/chapters");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertUniversity(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = universitySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug")?.toString() || undefined,
    district: formData.get("district")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] ?? parsed.error.message };
  }

  const slug =
    parsed.data.slug && parsed.data.slug.length > 0
      ? slugify(parsed.data.slug)
      : slugify(parsed.data.name);

  const data = {
    name: parsed.data.name,
    slug,
    district: parsed.data.district ?? null,
  };

  if (id) {
    await prisma.university.update({ where: { id }, data });
  } else {
    await prisma.university.create({ data });
  }

  revalidatePath("/admin/universities");
  revalidatePath("/chapters");
  return { success: true };
}

export async function deleteUniversity(id: string) {
  try {
    await assertFullAdmin();
    await prisma.university.delete({ where: { id } });
    revalidatePath("/admin/universities");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

async function revalidateForumPublicPaths(forumId: string) {
  const row = await prisma.forum.findUnique({ where: { id: forumId }, select: { slug: true } });
  if (row) {
    revalidatePath(`/forums/${row.slug}`);
  }
  revalidatePath("/forums");
  revalidatePath("/", "layout");
}

export async function upsertForum(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = forumSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    sortOrder: formData.get("sortOrder"),
    isPublished: formData.get("isPublished") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? parsed.error.message };
  }
  const slug =
    parsed.data.slug && parsed.data.slug.length > 0 ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const data = {
    title: parsed.data.title,
    slug,
    description: parsed.data.description ?? null,
    sort_order: parsed.data.sortOrder,
    is_published: parsed.data.isPublished,
  };
  let prevSlug: string | null = null;
  if (id) {
    const existing = await prisma.forum.findUnique({ where: { id }, select: { slug: true } });
    prevSlug = existing?.slug ?? null;
    await prisma.forum.update({ where: { id }, data });
  } else {
    await prisma.forum.create({ data });
  }
  if (prevSlug && prevSlug !== slug) {
    revalidatePath(`/forums/${prevSlug}`);
  }
  revalidatePath(`/forums/${slug}`);
  revalidatePath("/forums");
  revalidatePath("/admin/forums");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteForum(id: string) {
  try {
    await assertFullAdmin();
    const row = await prisma.forum.findUnique({ where: { id }, select: { slug: true } });
    await prisma.forum.delete({ where: { id } });
    if (row) {
      revalidatePath(`/forums/${row.slug}`);
    }
    revalidatePath("/forums");
    revalidatePath("/admin/forums");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertForumLabel(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = forumLabelSchema.safeParse({
    forumId: formData.get("forumId"),
    title: formData.get("title"),
    description: formData.get("description")?.toString() || undefined,
    sortOrder: formData.get("sortOrder"),
    isPublished: formData.get("isPublished") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? parsed.error.message };
  }
  const data = {
    forum_id: parsed.data.forumId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    sort_order: parsed.data.sortOrder,
    is_published: parsed.data.isPublished,
  };
  if (id) {
    await prisma.forumLabel.update({ where: { id }, data });
  } else {
    await prisma.forumLabel.create({ data });
  }
  await revalidateForumPublicPaths(parsed.data.forumId);
  revalidatePath("/admin/forums");
  revalidatePath(`/admin/forums/${parsed.data.forumId}/labels`);
  return { success: true };
}

export async function deleteForumLabel(id: string) {
  try {
    await assertFullAdmin();
    const row = await prisma.forumLabel.findUnique({ where: { id }, select: { forum_id: true } });
    if (!row) {
      return { error: "Not found" };
    }
    await prisma.forumLabel.delete({ where: { id } });
    await revalidateForumPublicPaths(row.forum_id);
    revalidatePath(`/admin/forums/${row.forum_id}/labels`);
    revalidatePath("/admin/forums");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertForumMember(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const id = formData.get("id")?.toString();
  const parsed = forumMemberSchema.safeParse({
    forumId: formData.get("forumId"),
    labelId: formData.get("labelId"),
    name: formData.get("name"),
    position: formData.get("position"),
    bio: formData.get("bio")?.toString() || undefined,
    photoUrl: formData.get("photoUrl")?.toString() || "",
    sortOrder: formData.get("sortOrder"),
    isPublished: formData.get("isPublished") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] ?? parsed.error.message };
  }
  const data = {
    forum_id: parsed.data.forumId,
    label_id: parsed.data.labelId,
    name: parsed.data.name,
    position: parsed.data.position,
    bio: parsed.data.bio ?? null,
    photo_url: parsed.data.photoUrl || null,
    sort_order: parsed.data.sortOrder,
    is_published: parsed.data.isPublished,
  };
  if (id) {
    await prisma.forumMember.update({ where: { id }, data });
  } else {
    await prisma.forumMember.create({ data });
  }
  await revalidateForumPublicPaths(parsed.data.forumId);
  revalidatePath("/admin/forums");
  revalidatePath(`/admin/forums/${parsed.data.forumId}/members`);
  return { success: true };
}

export async function deleteForumMember(id: string) {
  try {
    await assertFullAdmin();
    const row = await prisma.forumMember.findUnique({ where: { id }, select: { forum_id: true } });
    if (!row) {
      return { error: "Not found" };
    }
    await prisma.forumMember.delete({ where: { id } });
    await revalidateForumPublicPaths(row.forum_id);
    revalidatePath(`/admin/forums/${row.forum_id}/members`);
    revalidatePath("/admin/forums");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}
