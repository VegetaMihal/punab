import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import {
  resolveAdminAccess,
  type AdminAccess,
} from "@/lib/auth/admin-access";
import type { AdminScope, Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export type AdminAuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  profile: Pick<Profile, "role" | "admin_scopes">;
  access: AdminAccess;
};

async function loadAdminContext(): Promise<AdminAuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true, admin_scopes: true },
  });
  if (!profile) {
    throw new Error("Forbidden");
  }
  const role = profile.role as Profile["role"];
  const access = resolveAdminAccess({ role, admin_scopes: profile.admin_scopes });
  const admin_scopes = access.scopes;
  if (!access.canAccessAdmin) {
    throw new Error("Forbidden");
  }
  return {
    supabase,
    user,
    profile: { role, admin_scopes },
    access,
  };
}

/** Any PUNAB admin panel access (full or scoped). */
export async function assertAdmin(): Promise<AdminAuthContext> {
  return loadAdminContext();
}

/** Full CMS admin only (empty admin_scopes). */
export async function assertFullAdmin(): Promise<AdminAuthContext> {
  const ctx = await loadAdminContext();
  if (!ctx.access.isFullAdmin) {
    throw new Error("Forbidden");
  }
  return ctx;
}

/** Scoped area: invitations, certificates, July Award cards, or July Award participants (full admin also allowed). */
export async function assertAdminScope(scope: AdminScope): Promise<AdminAuthContext> {
  const ctx = await loadAdminContext();
  const allowed = {
    invitations: ctx.access.canInvitations,
    certificates: ctx.access.canCertificates,
    july_award_cards: ctx.access.canJulyAwardCards,
    july_award_participants: ctx.access.canJulyAwardParticipants,
  }[scope];
  if (!allowed) {
    throw new Error("Forbidden");
  }
  return ctx;
}
