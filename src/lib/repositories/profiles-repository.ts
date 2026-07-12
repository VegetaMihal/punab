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

const ADMIN_PAGE_SIZE = 50;

export async function listAllProfilesAdmin(page = 1): Promise<{ profiles: Profile[]; total: number; pageSize: number }> {
  const skip = (page - 1) * ADMIN_PAGE_SIZE;
  const [rows, total] = await Promise.all([
    prisma.profile.findMany({
      orderBy: { created_at: "desc" },
      take: ADMIN_PAGE_SIZE,
      skip,
    }),
    prisma.profile.count(),
  ]);
  return { profiles: rows.map(toProfile), total, pageSize: ADMIN_PAGE_SIZE };
}

export async function countPendingMembers(): Promise<number> {
  return prisma.profile.count({ where: { membership_status: "pending" } });
}
