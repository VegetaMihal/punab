import { toProfile } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { AdminScope, Profile } from "@/types/database";

const ALLOWED = new Set<AdminScope>(["invitations", "certificates", "july_award_cards", "july_award_participants"]);

function normalizeScopes(scopes: AdminScope[]): AdminScope[] {
  return [...new Set(scopes.filter((s) => ALLOWED.has(s)))];
}

export async function listAdminProfiles(): Promise<Profile[]> {
  const rows = await prisma.profile.findMany({
    where: { role: "admin" },
    orderBy: { email: "asc" },
  });
  return rows.map(toProfile);
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const row = await prisma.profile.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  return row ? toProfile(row) : null;
}

export async function setProfileAdminAccess(
  profileId: string,
  input: { role: "admin" | "member"; admin_scopes: AdminScope[] },
): Promise<Profile | null> {
  const scopes = input.role === "admin" ? normalizeScopes(input.admin_scopes) : [];
  const row = await prisma.profile.update({
    where: { id: profileId },
    data: {
      role: input.role,
      admin_scopes: scopes,
    },
  });
  return toProfile(row);
}

/** Minimal profile for admin-only coordinators (no member signup). */
/** Align profiles.id with auth.users.id when they diverged (e.g. seeded admin@punab.test). */
export async function syncProfileIdToAuthUser(input: {
  email: string;
  authUserId: string;
}): Promise<void> {
  const profile = await getProfileByEmail(input.email);
  if (!profile || profile.id === input.authUserId) return;

  const conflict = await prisma.profile.findUnique({ where: { id: input.authUserId } });
  if (conflict) {
    throw new Error(
      `Cannot link ${input.email}: another profile already uses this login id. Ask support to merge accounts.`,
    );
  }

  await prisma.$executeRaw`
    UPDATE profiles
    SET id = ${input.authUserId}::uuid, updated_at = now()
    WHERE id = ${profile.id}::uuid
  `;
}

export async function createProvisionerProfile(input: {
  id: string;
  email: string;
  full_name: string;
}): Promise<Profile> {
  const row = await prisma.profile.create({
    data: {
      id: input.id,
      full_name: input.full_name,
      email: input.email.toLowerCase(),
      role: "member",
      membership_status: "approved",
    },
  });
  return toProfile(row);
}

export async function setProfileAdminAccessByEmail(
  email: string,
  input: { role: "admin" | "member"; admin_scopes: AdminScope[] },
): Promise<Profile | null> {
  const existing = await getProfileByEmail(email);
  if (!existing) return null;
  return setProfileAdminAccess(existing.id, input);
}
