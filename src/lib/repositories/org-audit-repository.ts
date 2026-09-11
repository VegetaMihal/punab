import { prisma } from "@/lib/db/prisma";

/** §19: audit log for report/activity/reporter/designation/forum-status changes — actor, timestamp, before/after. */
export async function writeAuditLog(input: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  notes?: string | null;
}): Promise<void> {
  await prisma.orgAuditLog.create({
    data: {
      actor_id: input.actorId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      old_value: input.oldValue === undefined ? undefined : (input.oldValue as object),
      new_value: input.newValue === undefined ? undefined : (input.newValue as object),
      notes: input.notes ?? null,
    },
  });
}

export async function listAuditLogs(limit = 100) {
  return prisma.orgAuditLog.findMany({ orderBy: { created_at: "desc" }, take: limit });
}
