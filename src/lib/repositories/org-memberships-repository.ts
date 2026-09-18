import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";
import { assignReporter } from "@/lib/repositories/org-reporters-repository";

export async function listActiveForumMembers(forumId: string) {
  return prisma.orgForumMembership.findMany({
    where: { forum_id: forumId, is_active: true },
    include: { member: { select: { id: true, full_name: true, email: true } }, designation: true },
    orderBy: { designation: { numeric_rank: "desc" } },
  });
}

const CAMPUS_RANK: Record<string, number> = { member: 0, associate: 1, representative: 2 };

/** CAMPUS-003: on a Full Forum, a completely new person can't be added straight in as a plain
 * Forum Member — they must have already reached at least Campus Associate (or Campus
 * Representative, if org.campus_representative_required_before_forum_member is on) on this
 * Forum's campus committee. Existing members being promoted to a higher designation, and
 * appointments on Incomplete Forums, are unaffected. */
async function checkCampusEligibility(input: {
  forumId: string;
  memberId: string;
  designationLevelId: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const [forum, designation] = await Promise.all([
    prisma.orgForum.findUniqueOrThrow({ where: { id: input.forumId }, select: { status: true, name: true } }),
    prisma.orgDesignationLevel.findUniqueOrThrow({ where: { id: input.designationLevelId }, select: { level_code: true } }),
  ]);

  if (forum.status !== "full" || designation.level_code !== "forum_member") {
    return { ok: true };
  }

  const setting = await prisma.siteSetting.findUnique({
    where: { key: "org.campus_representative_required_before_forum_member" },
  });
  const requireRepresentative = setting?.value === "true";
  const minRank = requireRepresentative ? CAMPUS_RANK.representative : CAMPUS_RANK.associate;

  const campusRoles = await prisma.orgCampusRole.findMany({
    where: { forum_id: input.forumId, member_id: input.memberId, is_active: true },
    select: { campus_level: true },
  });
  const reachedRank = Math.max(-1, ...campusRoles.map((r) => CAMPUS_RANK[r.campus_level] ?? -1));

  if (reachedRank < minRank) {
    const needLabel = requireRepresentative ? "Campus Representative" : "Campus Associate";
    return {
      ok: false,
      reason: `${forum.name} is a Full Forum — new Forum Members must have already reached at least ${needLabel} on this Forum's campus committee first.`,
    };
  }
  return { ok: true };
}

export type AddForumMembershipResult =
  | { ok: true; membership: Awaited<ReturnType<typeof prisma.orgForumMembership.create>> }
  | { ok: false; reason: string };

/** Designation history + duplicate-active-role checks land with the promotion workflow (Phase 2). */
export async function addForumMembership(input: {
  forumId: string;
  memberId: string;
  designationLevelId: string;
  addedBy: string | null;
}): Promise<AddForumMembershipResult> {
  const eligibility = await checkCampusEligibility(input);
  if (!eligibility.ok) return eligibility;

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

  // REP-003 (Secretary variant): appointing someone Forum Secretary on an Incomplete Forum makes
  // them the fixed Primary Reporter, same as Convenor auto-becomes Primary once the Forum is Full.
  const designation = await prisma.orgDesignationLevel.findUnique({
    where: { id: input.designationLevelId },
    select: { level_code: true },
  });
  if (designation?.level_code === "forum_secretary") {
    const forum = await prisma.orgForum.findUnique({ where: { id: input.forumId }, select: { status: true } });
    if (forum?.status === "incomplete" && input.addedBy) {
      await assignReporter({
        forumId: input.forumId,
        memberId: input.memberId,
        reporterType: "primary",
        authorizedBy: input.addedBy,
      });
    }
  }

  return { ok: true, membership: created };
}

export async function removeForumMembership(id: string) {
  const membership = await prisma.orgForumMembership.findUnique({
    where: { id },
    select: { forum_id: true, member_id: true, designation: { select: { level_code: true } } },
  });

  await prisma.orgForumMembership.update({
    where: { id },
    data: { is_active: false, end_date: new Date() },
  });

  // Removing a Secretary/Convenor from their seat also removes the reporter power that came with it.
  if (membership && (membership.designation.level_code === "forum_secretary" || membership.designation.level_code === "forum_convenor")) {
    await prisma.orgReporterAssignment.updateMany({
      where: {
        forum_id: membership.forum_id,
        member_id: membership.member_id,
        reporter_type: "primary",
        is_active: true,
      },
      data: { is_active: false, end_date: new Date() },
    });
  }
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
