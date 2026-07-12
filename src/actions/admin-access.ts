"use server";

import { revalidatePath } from "next/cache";
import { provisionAdminCredentials } from "@/lib/auth/admin-user-password";
import { assertFullAdmin } from "@/lib/auth/require-admin";
import {
  getProfileByEmail,
  setProfileAdminAccess,
  setProfileAdminAccessByEmail,
} from "@/lib/repositories/admin-access-repository";
import {
  adminAccessEmailSchema,
  grantAdminAccessSchema,
  setAdminPasswordSchema,
  updateAdminAccessSchema,
} from "@/lib/validations/admin-access";
import type { AdminScope } from "@/types/database";

const scopesFromForm = (
  invitations: boolean,
  certificates: boolean,
  julyAwardCards: boolean,
  julyAwardParticipants: boolean
): AdminScope[] => {
  const scopes: AdminScope[] = [];
  if (invitations) scopes.push("invitations");
  if (certificates) scopes.push("certificates");
  if (julyAwardCards) scopes.push("july_award_cards");
  if (julyAwardParticipants) scopes.push("july_award_participants");
  return scopes;
};

export type AdminAccessActionState = { error?: string; success?: boolean };

export async function grantAdminAccessByEmailAction(
  _prev: AdminAccessActionState,
  formData: FormData,
): Promise<AdminAccessActionState> {
  try {
    await assertFullAdmin();
    const parsed = grantAdminAccessSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      invitations: formData.get("invitations") === "on",
      certificates: formData.get("certificates") === "on",
      julyAwardCards: formData.get("julyAwardCards") === "on",
      julyAwardParticipants: formData.get("julyAwardParticipants") === "on",
    });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        error:
          fieldErrors.email?.[0] ??
          fieldErrors.password?.[0] ??
          parsed.error.message,
      };
    }
    const { userId } = await provisionAdminCredentials({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    await setProfileAdminAccess(userId, {
      role: "admin",
      admin_scopes: scopesFromForm(
        parsed.data.invitations,
        parsed.data.certificates,
        parsed.data.julyAwardCards,
        parsed.data.julyAwardParticipants
      ),
    });
    revalidatePath("/admin/access");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function setAdminPasswordByEmailAction(
  _prev: AdminAccessActionState,
  formData: FormData,
): Promise<AdminAccessActionState> {
  try {
    const { user } = await assertFullAdmin();
    const parsed = setAdminPasswordSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        error:
          fieldErrors.email?.[0] ??
          fieldErrors.password?.[0] ??
          parsed.error.message,
      };
    }
    const email = parsed.data.email.toLowerCase();
    const profile = await getProfileByEmail(email);
    if (!profile) {
      return { error: "Account not found" };
    }
    if (profile.id === user.id) {
      return { error: "Your primary admin account cannot be changed here" };
    }
    if (profile.role !== "admin") {
      return { error: "That email is not an admin account" };
    }
    await provisionAdminCredentials({
      email: parsed.data.email,
      password: parsed.data.password,
      displayName: profile.full_name,
    });
    revalidatePath("/admin/access");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function revokeAdminAccessByEmailAction(
  _prev: AdminAccessActionState,
  formData: FormData,
): Promise<AdminAccessActionState> {
  try {
    const { user } = await assertFullAdmin();
    const parsed = adminAccessEmailSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      return { error: "Invalid email" };
    }
    const email = parsed.data.email.toLowerCase();
    const profile = await getProfileByEmail(email);
    if (!profile) {
      return { error: "Account not found" };
    }
    if (profile.id === user.id) {
      return { error: "Cannot remove your own admin access" };
    }
    await setProfileAdminAccessByEmail(email, { role: "member", admin_scopes: [] });
    revalidatePath("/admin/access");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function updateAdminAccessByEmailAction(
  _prev: AdminAccessActionState,
  formData: FormData,
): Promise<AdminAccessActionState> {
  try {
    const { user } = await assertFullAdmin();
    const parsed = updateAdminAccessSchema.safeParse({
      email: formData.get("email"),
      invitations: formData.get("invitations") === "on",
      certificates: formData.get("certificates") === "on",
      julyAwardCards: formData.get("julyAwardCards") === "on",
      julyAwardParticipants: formData.get("julyAwardParticipants") === "on",
    });
    if (!parsed.success) {
      return { error: "Invalid input" };
    }
    const email = parsed.data.email.toLowerCase();
    const profile = await getProfileByEmail(email);
    if (!profile) {
      return { error: "Account not found" };
    }
    if (profile.id === user.id) {
      return { error: "Your primary admin account cannot be changed here" };
    }
    await setProfileAdminAccessByEmail(email, {
      role: "admin",
      admin_scopes: scopesFromForm(
        parsed.data.invitations,
        parsed.data.certificates,
        parsed.data.julyAwardCards,
        parsed.data.julyAwardParticipants
      ),
    });
    revalidatePath("/admin/access");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}
