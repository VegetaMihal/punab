import { cache } from "react";
import { toForum, toForumLabel, toForumMember } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { Forum, ForumLabel, ForumMember } from "@/types/database";

/** Published forums for the public directory (`/forums`). Order follows admin sort. */
export async function listPublishedForums(): Promise<Forum[]> {
  const rows = await prisma.forum.findMany({
    where: { is_published: true },
    orderBy: [{ sort_order: "asc" }, { title: "asc" }],
  });
  return rows.map(toForum);
}

/** Published forum by URL slug with labels and members for public page. */
export const getPublishedForumBySlug = cache(async (slug: string): Promise<{
  forum: Forum | null;
  labels: ForumLabel[];
  members: ForumMember[];
}> => {
  const forumRow = await prisma.forum.findFirst({
    where: { slug, is_published: true },
  });
  if (!forumRow) {
    return { forum: null, labels: [], members: [] };
  }
  const forum = toForum(forumRow);
  const labels = await prisma.forumLabel.findMany({
    where: { forum_id: forum.id, is_published: true },
    orderBy: { sort_order: "asc" },
  });
  const labelIds = labels.map((l) => l.id);
  const members =
    labelIds.length === 0
      ? []
      : await prisma.forumMember.findMany({
          where: { forum_id: forum.id, is_published: true, label_id: { in: labelIds } },
          orderBy: { sort_order: "asc" },
        });
  return {
    forum,
    labels: labels.map(toForumLabel),
    members: members.map(toForumMember),
  };
})

export async function listForumsAdmin(): Promise<Forum[]> {
  const rows = await prisma.forum.findMany({
    orderBy: [{ sort_order: "asc" }, { title: "asc" }],
  });
  return rows.map(toForum);
}

export async function getForumAdmin(id: string): Promise<Forum | null> {
  const row = await prisma.forum.findUnique({ where: { id } });
  return row ? toForum(row) : null;
}

export async function getForumAdminBySlug(slug: string): Promise<Forum | null> {
  const row = await prisma.forum.findUnique({ where: { slug } });
  return row ? toForum(row) : null;
}

export async function listForumLabelsAdmin(forumId: string): Promise<ForumLabel[]> {
  const rows = await prisma.forumLabel.findMany({
    where: { forum_id: forumId },
    orderBy: { sort_order: "asc" },
  });
  return rows.map(toForumLabel);
}

export async function getForumLabelAdmin(id: string): Promise<ForumLabel | null> {
  const row = await prisma.forumLabel.findUnique({ where: { id } });
  return row ? toForumLabel(row) : null;
}

export async function listForumLabelOptions(forumId: string): Promise<{ id: string; title: string }[]> {
  return prisma.forumLabel.findMany({
    where: { forum_id: forumId },
    select: { id: true, title: true },
    orderBy: { sort_order: "asc" },
  });
}

export async function listForumMembersAdmin(forumId: string): Promise<ForumMember[]> {
  const rows = await prisma.forumMember.findMany({
    where: { forum_id: forumId },
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
  });
  return rows.map(toForumMember);
}

export async function getForumMemberAdmin(id: string): Promise<ForumMember | null> {
  const row = await prisma.forumMember.findUnique({ where: { id } });
  return row ? toForumMember(row) : null;
}
