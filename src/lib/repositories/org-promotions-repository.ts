import { prisma } from "@/lib/db/prisma";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";

export type ApplyResult = { ok: true; applicationId: string } | { ok: false; reason: string };

/** PROMO-002/003: 2-month (configurable) cycle at current level makes a member eligible to apply — never auto-promotes. */
export async function applyForPromotion(input: { memberId: string; forumId: string }): Promise<ApplyResult> {
  const membership = await prisma.orgForumMembership.findFirst({
    where: { forum_id: input.forumId, member_id: input.memberId, is_active: true },
    include: { designation: { include: { scheme: { include: { levels: true } } } } },
  });
  if (!membership) {
    return { ok: false, reason: "You are not an active member of this Forum." };
  }

  const nextLevel = membership.designation.scheme.levels.find(
    (l) => l.numeric_rank === membership.designation.numeric_rank + 1
  );
  if (!nextLevel) {
    return { ok: false, reason: "You are already at the top of this Forum's hierarchy." };
  }

  const settings = await getSiteSettingsMap();
  const cycleMonths = Number.parseInt(settings["org.promotion_cycle_months"], 10) || 2;
  const monthsAtLevel = (Date.now() - membership.start_date.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
  if (monthsAtLevel < cycleMonths) {
    return { ok: false, reason: `Not yet eligible — ${cycleMonths - monthsAtLevel > 0 ? (cycleMonths - monthsAtLevel).toFixed(1) : 0} more month(s) at current level required.` };
  }

  const existingPending = await prisma.orgPromotionApplication.findFirst({
    where: { member_id: input.memberId, forum_id: input.forumId, status: "pending" },
  });
  if (existingPending) {
    return { ok: false, reason: "You already have a pending promotion application for this Forum." };
  }

  const application = await prisma.orgPromotionApplication.create({
    data: {
      member_id: input.memberId,
      forum_id: input.forumId,
      current_designation_level_id: membership.designation_level_id,
      target_designation_level_id: nextLevel.id,
      eligibility_snapshot: { monthsAtLevel, cycleMonths, currentLevel: membership.designation.label, nextLevel: nextLevel.label },
    },
  });

  await writeAuditLog({
    actorId: input.memberId,
    action: "promotion_application_submitted",
    entityType: "org_promotion_application",
    entityId: application.id,
    newValue: { forumId: input.forumId, targetLevel: nextLevel.label },
  });

  return { ok: true, applicationId: application.id };
}

export async function listPendingApplications() {
  const applications = await prisma.orgPromotionApplication.findMany({
    where: { status: "pending" },
    include: {
      member: { select: { id: true, full_name: true, email: true } },
      forum: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { applied_at: "asc" },
  });

  const levelIds = Array.from(
    new Set(applications.flatMap((a) => [a.current_designation_level_id, a.target_designation_level_id]))
  );
  const levels = await prisma.orgDesignationLevel.findMany({ where: { id: { in: levelIds } } });
  const levelById = new Map(levels.map((l) => [l.id, l]));

  return applications.map((a) => ({
    ...a,
    currentLevelLabel: levelById.get(a.current_designation_level_id)?.label ?? "Unknown",
    targetLevelLabel: levelById.get(a.target_designation_level_id)?.label ?? "Unknown",
  }));
}

export async function listMyApplications(memberId: string) {
  return prisma.orgPromotionApplication.findMany({
    where: { member_id: memberId },
    include: { forum: { select: { name: true } } },
    orderBy: { applied_at: "desc" },
  });
}

export type DecideResult = { ok: true } | { ok: false; reason: string };

/** PROMO-006: approval creates an immutable designation history record; single-position levels are guarded. */
export async function approvePromotionApplication(input: {
  applicationId: string;
  decidedBy: string;
  notes: string | null;
}): Promise<DecideResult> {
  const application = await prisma.orgPromotionApplication.findUniqueOrThrow({ where: { id: input.applicationId } });

  if (application.status !== "pending") {
    return { ok: false, reason: "This application has already been decided." };
  }

  const [currentMembership, targetLevel] = await Promise.all([
    prisma.orgForumMembership.findFirst({
      where: { forum_id: application.forum_id, member_id: application.member_id, is_active: true },
    }),
    prisma.orgDesignationLevel.findUniqueOrThrow({ where: { id: application.target_designation_level_id } }),
  ]);
  if (!currentMembership) {
    return { ok: false, reason: "Member is no longer an active Forum member." };
  }

  if (targetLevel.multiplicity === "single") {
    const occupied = await prisma.orgForumMembership.findFirst({
      where: {
        forum_id: application.forum_id,
        designation_level_id: targetLevel.id,
        is_active: true,
        member_id: { not: application.member_id },
      },
    });
    if (occupied) {
      return { ok: false, reason: `${targetLevel.label} is a single-holder position and is currently occupied.` };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.orgForumMembership.update({
      where: { id: currentMembership.id },
      data: { is_active: false, end_date: new Date() },
    });
    await tx.orgForumMembership.create({
      data: {
        forum_id: application.forum_id,
        member_id: application.member_id,
        designation_level_id: targetLevel.id,
      },
    });
    await tx.orgDesignationHistory.create({
      data: {
        member_id: application.member_id,
        forum_id: application.forum_id,
        old_designation_level_id: application.current_designation_level_id,
        new_designation_level_id: targetLevel.id,
        approved_by: input.decidedBy,
        application_reference: application.id,
        notes: input.notes,
      },
    });
    await tx.orgPromotionApplication.update({
      where: { id: application.id },
      data: { status: "approved", decided_by: input.decidedBy, decided_at: new Date(), decision_notes: input.notes },
    });
  });

  await writeAuditLog({
    actorId: input.decidedBy,
    action: "promotion_application_approved",
    entityType: "org_promotion_application",
    entityId: application.id,
    newValue: { targetLevel: targetLevel.label },
  });

  return { ok: true };
}

export async function rejectPromotionApplication(input: {
  applicationId: string;
  decidedBy: string;
  notes: string | null;
}): Promise<DecideResult> {
  const application = await prisma.orgPromotionApplication.findUniqueOrThrow({ where: { id: input.applicationId } });
  if (application.status !== "pending") {
    return { ok: false, reason: "This application has already been decided." };
  }

  await prisma.orgPromotionApplication.update({
    where: { id: input.applicationId },
    data: { status: "rejected", decided_by: input.decidedBy, decided_at: new Date(), decision_notes: input.notes },
  });

  await writeAuditLog({
    actorId: input.decidedBy,
    action: "promotion_application_rejected",
    entityType: "org_promotion_application",
    entityId: input.applicationId,
    notes: input.notes,
  });

  return { ok: true };
}
