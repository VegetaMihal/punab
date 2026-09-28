import { toProfile } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import { GRANTABLE_ADMIN_SCOPES } from "@/lib/auth/admin-access";
import type { AdminScope, AdminTitle, Profile } from "@/types/database";

const ALLOWED = new Set<AdminScope>([...GRANTABLE_ADMIN_SCOPES, "org_portal"]);

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

export async function getProfileById(id: string): Promise<Profile | null> {
  const row = await prisma.profile.findUnique({ where: { id } });
  return row ? toProfile(row) : null;
}

export async function getApprovedNonAdminProfile(memberId: string): Promise<Profile | null> {
  const row = await prisma.profile.findFirst({
    where: { id: memberId, membership_status: "approved", role: { not: "admin" } },
  });
  return row ? toProfile(row) : null;
}

/** Type-to-search candidates for granting admin access — approved members only, excludes existing admins. */
export async function searchApprovedMembersNotAdmin(query: string) {
  return prisma.profile.findMany({
    where: {
      membership_status: "approved",
      role: { not: "admin" },
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

export async function setProfileAdminAccess(
  profileId: string,
  input: { role: "admin" | "member"; admin_scopes: AdminScope[]; admin_title?: AdminTitle | null },
): Promise<Profile | null> {
  // What the caller passed is what gets stored — no implicit scope injection, so a re-save can never
  // silently turn a full admin (empty scopes) into a scoped one.
  const scopes = input.role === "admin" ? normalizeScopes(input.admin_scopes) : [];
  const title = input.role === "admin" && scopes.includes("org_portal") ? (input.admin_title ?? null) : null;
  const row = await prisma.profile.update({
    where: { id: profileId },
    data: {
      role: input.role,
      admin_scopes: scopes,
      admin_title: title,
    },
  });
  return toProfile(row);
}

export async function setProfileAdminAccessByEmail(
  email: string,
  input: { role: "admin" | "member"; admin_scopes: AdminScope[]; admin_title?: AdminTitle | null },
): Promise<Profile | null> {
  const existing = await getProfileByEmail(email);
  if (!existing) return null;
  return setProfileAdminAccess(existing.id, input);
}
