import {
  createProvisionerProfile,
  getProfileByEmail,
  syncProfileIdToAuthUser,
} from "@/lib/repositories/admin-access-repository";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabase = createServiceRoleSupabase();
  const target = email.toLowerCase();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match?.id) return match.id;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

async function upsertAuthUser(input: {
  profileId?: string;
  email: string;
  password: string;
  fullName: string;
}): Promise<string> {
  const supabase = createServiceRoleSupabase();
  const email = input.email.toLowerCase();

  const authIdByEmail = await findAuthUserIdByEmail(email);
  const candidateIds = [...new Set([authIdByEmail, input.profileId].filter(Boolean))] as string[];

  for (const userId of candidateIds) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: input.password,
      email_confirm: true,
    });
    if (!error) return userId;
    const notFound =
      error.message.toLowerCase().includes("not found") || error.status === 404;
    if (!notFound) throw new Error(error.message);
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    ...(input.profileId ? { id: input.profileId } : {}),
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (!createError && created.user?.id) {
    return created.user.id;
  }

  const alreadyExists =
    createError?.message.toLowerCase().includes("already") ||
    createError?.status === 422;
  if (!alreadyExists) {
    throw new Error(createError?.message ?? "Could not create login");
  }

  const existingId = await findAuthUserIdByEmail(email);
  if (!existingId) {
    throw new Error("Login exists for this email but could not be linked. Contact support.");
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(existingId, {
    password: input.password,
    email_confirm: true,
  });
  if (updateError) throw new Error(updateError.message);
  return existingId;
}

/**
 * Ensures Supabase Auth + profiles row for admin provisioning (no public signup required).
 */
export async function provisionAdminCredentials(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ userId: string; email: string; fullName: string }> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.displayName?.trim() || email.split("@")[0] || "PUNAB Admin";

  const existingProfile = await getProfileByEmail(email);
  const authUserId = await upsertAuthUser({
    profileId: existingProfile?.id,
    email,
    password: input.password,
    fullName: existingProfile?.full_name ?? fullName,
  });

  if (existingProfile && existingProfile.id !== authUserId) {
    await syncProfileIdToAuthUser({ email, authUserId });
  }

  let profile = await getProfileByEmail(email);
  if (!profile) {
    profile = await createProvisionerProfile({
      id: authUserId,
      email,
      full_name: fullName,
    });
  }

  return { userId: profile.id, email: profile.email, fullName: profile.full_name };
}
