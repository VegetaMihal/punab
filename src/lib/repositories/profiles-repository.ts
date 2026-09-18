import { toProfile } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { MembershipStatus } from "@/types/database";
import type { Profile } from "@/types/database";

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const row = await prisma.profile.findUnique({ where: { id: userId } });
  return row ? toProfile(row) : null;
}

export async function upsertProfileAfterSignup(input: {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  university_id: string;
  department: string;
  student_id: string;
  session: string;
  district: string;
  photo_url?: string;
}): Promise<void> {
  await prisma.profile.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      full_name: input.full_name,
      email: input.email,
      role: "member",
      membership_status: "pending",
      phone: input.phone,
      university_id: input.university_id,
      department: input.department,
      student_id: input.student_id,
      session: input.session,
      district: input.district,
      photo_url: input.photo_url,
    },
    update: {
      full_name: input.full_name,
      email: input.email,
      phone: input.phone,
      university_id: input.university_id,
      department: input.department,
      student_id: input.student_id,
      session: input.session,
      district: input.district,
      ...(input.photo_url ? { photo_url: input.photo_url } : {}),
    },
  });
}

export async function updateMemberApplication(
  userId: string,
  data: {
    full_name: string;
    phone: string;
    university_id: string | null;
    university_other: string | null;
    department: string;
    student_id: string;
    session: string;
    district: string;
  }
): Promise<void> {
  await prisma.profile.update({
    where: { id: userId },
    data,
  });
}

export async function updateProfilePhotoUrl(userId: string, photo_url: string | null): Promise<void> {
  await prisma.profile.update({
    where: { id: userId },
    data: { photo_url },
  });
}

export async function setMembershipStatus(profileId: string, status: MembershipStatus): Promise<void> {
  await prisma.profile.update({
    where: { id: profileId },
    data: { membership_status: status },
  });
}

/** AUTH-003/004: mark a member's temp password as issued and awaiting first login. */
export async function markAccountProvisioned(input: {
  profileId: string;
  membershipNumber: string;
  expiresAt: Date;
}): Promise<void> {
  await prisma.profile.update({
    where: { id: input.profileId },
    data: {
      membership_status: "approved",
      account_status: "pending_activation",
      first_login_required: true,
      temp_password_expires_at: input.expiresAt,
      membership_number: input.membershipNumber,
    },
  });
}

/** Completes AUTH-003 forced first-login password change. */
export async function completeFirstLoginPasswordChange(profileId: string): Promise<void> {
  await prisma.profile.update({
    where: { id: profileId },
    data: {
      account_status: "active",
      first_login_required: false,
      temp_password_expires_at: null,
    },
  });
}

export async function markWelcomeSeen(profileId: string): Promise<void> {
  await prisma.profile.update({
    where: { id: profileId },
    data: { welcomed_at: new Date() },
  });
}

const ADMIN_PAGE_SIZE = 50;

export async function listAllProfilesAdmin(
  page = 1,
  status?: MembershipStatus
): Promise<{ profiles: Profile[]; total: number; pageSize: number }> {
  const skip = (page - 1) * ADMIN_PAGE_SIZE;
  const where = status ? { membership_status: status } : {};
  const [rows, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: ADMIN_PAGE_SIZE,
      skip,
    }),
    prisma.profile.count({ where }),
  ]);
  return { profiles: rows.map(toProfile), total, pageSize: ADMIN_PAGE_SIZE };
}

export async function countPendingMembers(): Promise<number> {
  return prisma.profile.count({ where: { membership_status: "pending" } });
}

/** Each member's highest-ranked active Forum designation, plus Secondary Reporter if held — for admin listings that need the real org role, not just admin/member. */
export async function getOrgRoleLabels(memberIds: string[]): Promise<Map<string, string>> {
  if (memberIds.length === 0) return new Map();

  const [memberships, secondaryAssignments] = await Promise.all([
    prisma.orgForumMembership.findMany({
      where: { member_id: { in: memberIds }, is_active: true },
      select: {
        member_id: true,
        designation: { select: { label: true, numeric_rank: true } },
        forum: { select: { name: true } },
      },
    }),
    prisma.orgReporterAssignment.findMany({
      where: { member_id: { in: memberIds }, is_active: true, reporter_type: "secondary" },
      select: { member_id: true, forum: { select: { name: true } } },
    }),
  ]);

  const byMember = new Map<string, { label: string; rank: number; forumName: string }>();
  for (const m of memberships) {
    const current = byMember.get(m.member_id);
    if (!current || m.designation.numeric_rank > current.rank) {
      byMember.set(m.member_id, { label: m.designation.label, rank: m.designation.numeric_rank, forumName: m.forum.name });
    }
  }

  const secondaryByMember = new Map<string, string>();
  for (const a of secondaryAssignments) {
    secondaryByMember.set(a.member_id, a.forum.name);
  }

  const result = new Map<string, string>();
  for (const id of memberIds) {
    const top = byMember.get(id);
    const secondaryForum = secondaryByMember.get(id);
    const parts: string[] = [];
    if (top) parts.push(`${top.label} (${top.forumName})`);
    if (secondaryForum) parts.push(`Secondary Reporter (${secondaryForum})`);
    if (parts.length > 0) result.set(id, parts.join(", "));
  }
  return result;
}
