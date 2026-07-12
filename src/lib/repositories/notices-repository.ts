import { toNotice } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { Notice } from "@/types/database";

export async function listPublishedNoticesSummary(): Promise<
  Pick<Notice, "id" | "title" | "slug" | "excerpt" | "published_at">[]
> {
  const rows = await prisma.notice.findMany({
    where: { is_published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      published_at: true,
    },
    orderBy: [{ published_at: "desc" }, { updated_at: "desc" }],
  });
  return rows.map((n) => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    excerpt: n.excerpt,
    published_at: n.published_at ? n.published_at.toISOString() : null,
  }));
}

export async function getPublishedNoticeById(id: string): Promise<Notice | null> {
  const row = await prisma.notice.findFirst({
    where: { id, is_published: true },
  });
  return row ? toNotice(row) : null;
}

export async function listNoticesAdmin(): Promise<Notice[]> {
  const rows = await prisma.notice.findMany({
    orderBy: { updated_at: "desc" },
  });
  return rows.map(toNotice);
}

export async function getNoticeAdmin(id: string): Promise<Notice | null> {
  const row = await prisma.notice.findUnique({ where: { id } });
  return row ? toNotice(row) : null;
}
