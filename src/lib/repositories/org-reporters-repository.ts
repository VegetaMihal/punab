import { prisma } from "@/lib/db/prisma";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";

export async function listReporterAssignments(forumId: string) {
  return prisma.orgReporterAssignment.findMany({
    where: { forum_id: forumId, is_active: true },
    include: { member: { select: { id: true, full_name: true, email: true } } },
    orderBy: { reporter_type: "asc" },
  });
}

export type AssignReporterResult = { ok: true } | { ok: false; reason: string };

/**
 * REP-001..005/BR-005..007: one active primary reporter per Forum (DB-enforced), secondary count
 * capped by org.max_secondary_reporters (app-enforced — the cap is policy, not a hard identity rule).
 */
export async function assignReporter(input: {
  forumId: string;
  memberId: string;
  reporterType: "primary" | "secondary";
  authorizedBy: string;
}): Promise<AssignReporterResult> {
  if (input.reporterType === "primary") {
    await prisma.orgReporterAssignment.updateMany({
      where: { forum_id: input.forumId, reporter_type: "primary", is_active: true },
      data: { is_active: false, end_date: new Date() },
    });
  } else {
    const settings = await getSiteSettingsMap();
    const maxSecondary = Number.parseInt(settings["org.max_secondary_reporters"], 10) || 1;
    const activeSecondaryCount = await prisma.orgReporterAssignment.count({
      where: { forum_id: input.forumId, reporter_type: "secondary", is_active: true },
    });
    if (activeSecondaryCount >= maxSecondary) {
      return { ok: false, reason: `Maximum ${maxSecondary} active Secondary Reporter(s) already assigned.` };
    }
  }

  const created = await prisma.orgReporterAssignment.create({
    data: {
      forum_id: input.forumId,
      member_id: input.memberId,
      reporter_type: input.reporterType,
      authorized_by: input.authorizedBy,
    },
  });

  await writeAuditLog({
    actorId: input.authorizedBy,
    action: "reporter_assign",
    entityType: "org_reporter_assignment",
    entityId: created.id,
    newValue: { forumId: input.forumId, memberId: input.memberId, reporterType: input.reporterType },
  });

  return { ok: true };
}

export async function revokeReporterAssignment(id: string, revokedBy: string | null) {
  await prisma.orgReporterAssignment.update({
    where: { id },
    data: { is_active: false, end_date: new Date() },
  });

  await writeAuditLog({
    actorId: revokedBy,
    action: "reporter_revoke",
    entityType: "org_reporter_assignment",
    entityId: id,
  });
}

/** Forums a member currently holds an active reporter assignment for — drives the Reporter portal's forum list. */
export async function listMyReporterForums(memberId: string) {
  const assignments = await prisma.orgReporterAssignment.findMany({
    where: { member_id: memberId, is_active: true },
    include: { forum: { select: { id: true, name: true, slug: true, status: true } } },
  });
  return assignments.map((a) => ({
    forumId: a.forum.id,
    forumName: a.forum.name,
    forumSlug: a.forum.slug,
    forumStatus: a.forum.status,
    reporterType: a.reporter_type as "primary" | "secondary",
  }));
}

export async function getActivePrimaryReporterId(forumId: string): Promise<string | null> {
  const row = await prisma.orgReporterAssignment.findFirst({
    where: { forum_id: forumId, reporter_type: "primary", is_active: true },
    select: { member_id: true },
  });
  return row?.member_id ?? null;
}
