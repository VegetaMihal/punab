import { toEventRow } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { EventRow } from "@/types/database";

export async function listPublishedEvents(): Promise<EventRow[]> {
  const rows = await prisma.event.findMany({
    where: { is_published: true },
    orderBy: { start_at: "asc" },
  });
  return rows.map(toEventRow);
}

export async function getPublishedEventById(id: string): Promise<EventRow | null> {
  const row = await prisma.event.findFirst({
    where: { id, is_published: true },
  });
  return row ? toEventRow(row) : null;
}

export async function listEventsAdmin(): Promise<EventRow[]> {
  const rows = await prisma.event.findMany({
    orderBy: { start_at: "desc" },
  });
  return rows.map(toEventRow);
}

export async function getEventAdmin(id: string): Promise<EventRow | null> {
  const row = await prisma.event.findUnique({ where: { id } });
  return row ? toEventRow(row) : null;
}
