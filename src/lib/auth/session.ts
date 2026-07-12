import { resolveAdminAccess, type AdminAccess } from "@/lib/auth/admin-access";
import { createClient } from "@/lib/supabase/server";
import { toProfile } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export async function getSessionProfile(): Promise<{
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isFullAdmin: boolean;
  adminAccess: AdminAccess | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, profile: null, isAdmin: false, isFullAdmin: false, adminAccess: null };
  }
  try {
    const row = await prisma.profile.findUnique({ where: { id: user.id } });
    const profile = row ? toProfile(row) : null;
    const adminAccess = profile ? resolveAdminAccess(profile) : null;
    return {
      user,
      profile,
      isAdmin: adminAccess?.canAccessAdmin ?? false,
      isFullAdmin: adminAccess?.isFullAdmin ?? false,
      adminAccess,
    };
  } catch {
    // assumed: local dev / network — pooler unreachable; still render public UI (fail closed on admin)
    return { user, profile: null, isAdmin: false, isFullAdmin: false, adminAccess: null };
  }
}
