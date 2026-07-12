import { cache } from "react";
import { prisma } from "@/lib/db/prisma";

export const getHomeStats = cache(async () => {
  const [chapters, events, notices] = await Promise.all([
    prisma.chapter.count({ where: { is_published: true } }),
    prisma.event.count({ where: { is_published: true } }),
    prisma.notice.count({ where: { is_published: true } }),
  ]);
  return { chapters, events, notices };
});
