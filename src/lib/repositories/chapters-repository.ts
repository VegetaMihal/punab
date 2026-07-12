import { toChapter, toUniversity } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { Chapter, University } from "@/types/database";

export async function listPublishedChaptersWithUniversities(): Promise<{
  chapters: Pick<
    Chapter,
    "id" | "title" | "description" | "contact_email" | "member_count" | "university_id"
  >[];
  universityNames: Record<string, string>;
}> {
  const chapters = await prisma.chapter.findMany({
    where: { is_published: true },
    select: {
      id: true,
      title: true,
      description: true,
      contact_email: true,
      member_count: true,
      university_id: true,
    },
    orderBy: { title: "asc" },
  });
  const uniIds = [...new Set(chapters.map((c) => c.university_id).filter(Boolean))] as string[];
  const unis =
    uniIds.length > 0
      ? await prisma.university.findMany({
          where: { id: { in: uniIds } },
          select: { id: true, name: true },
        })
      : [];
  const universityNames = Object.fromEntries(unis.map((u) => [u.id, u.name]));
  return { chapters, universityNames };
}

export async function listChaptersAdmin(): Promise<Chapter[]> {
  const rows = await prisma.chapter.findMany({
    orderBy: { title: "asc" },
  });
  return rows.map(toChapter);
}

export async function getChapterAdmin(id: string): Promise<Chapter | null> {
  const row = await prisma.chapter.findUnique({ where: { id } });
  return row ? toChapter(row) : null;
}

export async function listUniversitiesAdmin(): Promise<University[]> {
  const rows = await prisma.university.findMany({ orderBy: { name: "asc" } });
  return rows.map(toUniversity);
}

export async function getUniversityAdmin(id: string): Promise<University | null> {
  const row = await prisma.university.findUnique({ where: { id } });
  return row ? toUniversity(row) : null;
}

export async function listUniversitiesForOptions(): Promise<{ id: string; name: string }[]> {
  return prisma.university.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
