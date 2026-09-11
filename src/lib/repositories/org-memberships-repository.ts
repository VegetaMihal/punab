import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";

export async function listActiveForumMembers(forumId: string) {
  return prisma.orgForumMembership.findMany({
    where: { forum_id: forumId, is_active: true },
    include: { member: { select: { id: true, full_name: true, email: true } }, designation: true },
    orderBy: { designation: { numeric_rank: "desc" } },
  });
}

/** Simple add — designation history + duplicate-active-role checks land with the promotion workflow (Phase 2). */
export async function addForumMembership(input: {
  forumId: string;
  memberId: string;
  designationLevelId: string;
  addedBy: string | null;
}) {
  const created = await prisma.orgForumMembership.create({
    data: {
      forum_id: input.forumId,
      member_id: input.memberId,
      designation_level_id: input.designationLevelId,
    },
  });

  await writeAuditLog({
    actorId: input.addedBy,
    action: "forum_membership_add",
    entityType: "org_forum_membership",
    entityId: created.id,
    newValue: { forumId: input.forumId, memberId: input.memberId, designationLevelId: input.designationLevelId },
  });

  return created;
}

export async function removeForumMembership(id: string) {
  await prisma.orgForumMembership.update({
    where: { id },
    data: { is_active: false, end_date: new Date() },
  });
}

/** Candidates for "add to Forum": approved members not already active in this Forum. */
export async function listApprovedMembersNotInForum(forumId: string) {
  const active = await prisma.orgForumMembership.findMany({
    where: { forum_id: forumId, is_active: true },
    select: { member_id: true },
  });
  const excludeIds = active.map((a) => a.member_id);
  return prisma.profile.findMany({
    where: {
      membership_status: "approved",
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    },
    select: { id: true, full_name: true, email: true },
    orderBy: { full_name: "asc" },
    take: 20,
  });
}

/** Type-to-search candidates for "add to Forum" — same exclusion rule, filtered server-side, capped for scale. */
export async function searchApprovedMembersNotInForum(forumId: string, query: string) {
  const active = await prisma.orgForumMembership.findMany({
    where: { forum_id: forumId, is_active: true },
    select: { member_id: true },
  });
  const excludeIds = active.map((a) => a.member_id);
  return prisma.profile.findMany({
    where: {
      membership_status: "approved",
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
      OR: [
        { full_name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, full_name: true, email: true },
    orderBy: { full_name: "asc" },
    take: 20,
  });
}
