import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";

export async function listCampusRoles(forumId: string) {
  return prisma.orgCampusRole.findMany({
    where: { forum_id: forumId, is_active: true },
    include: { member: { select: { id: true, full_name: true } }, campus: { select: { id: true, name: true } } },
    orderBy: { campus_level: "desc" },
  });
}

export type AddCampusRoleResult = { ok: true } | { ok: false; reason: string };

/** CAMPUS-001/002: Full Forum only; DB partial-unique index blocks a second active Representative for the same campus. */
export async function addCampusRole(input: {
  forumId: string;
  campusId: string;
  memberId: string;
  campusLevel: "member" | "associate" | "representative";
  addedBy: string;
}): Promise<AddCampusRoleResult> {
  const forum = await prisma.orgForum.findUniqueOrThrow({ where: { id: input.forumId } });
  if (forum.status !== "full") {
    return { ok: false, reason: "Only a Full Forum can create campus committee roles." };
  }

  try {
    const created = await prisma.orgCampusRole.create({
      data: {
        forum_id: input.forumId,
        campus_id: input.campusId,
        member_id: input.memberId,
        campus_level: input.campusLevel,
      },
    });
    await writeAuditLog({
      actorId: input.addedBy,
      action: "campus_role_add",
      entityType: "org_campus_role",
      entityId: created.id,
      newValue: input,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message.includes("org_campus_roles_active_rep_unique")) {
      return { ok: false, reason: "This campus already has an active Representative for this Forum." };
    }
    return { ok: false, reason: e instanceof Error ? e.message : "Could not add campus role" };
  }
}

export async function removeCampusRole(id: string, removedBy: string): Promise<void> {
  await prisma.orgCampusRole.update({ where: { id }, data: { is_active: false, end_date: new Date() } });
  await writeAuditLog({
    actorId: removedBy,
    action: "campus_role_remove",
    entityType: "org_campus_role",
    entityId: id,
  });
}
