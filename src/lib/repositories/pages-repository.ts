import { toPageRow } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { PageRow } from "@/types/database";

export async function getPublishedPageBySlug(slug: string): Promise<PageRow | null> {
  const row = await prisma.page.findFirst({
    where: { slug, is_published: true },
  });
  return row ? toPageRow(row) : null;
}

export async function listPagesAdmin(): Promise<PageRow[]> {
  const rows = await prisma.page.findMany({
    orderBy: { updated_at: "desc" },
  });
  return rows.map(toPageRow);
}

export async function getPageAdmin(id: string): Promise<PageRow | null> {
  const row = await prisma.page.findUnique({ where: { id } });
  return row ? toPageRow(row) : null;
}
