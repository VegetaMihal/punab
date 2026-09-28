"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_ROLES } from "@/lib/auth/admin-access";
import { assertFullAdmin } from "@/lib/auth/require-admin";
import {
  getApprovedNonAdminProfile,
  getProfileByEmail,
  getProfileById,
  searchApprovedMembersNotAdmin,
  setProfileAdminAccess,
  setProfileAdminAccessByEmail,
} from "@/lib/repositories/admin-access-repository";
import {
  adminAccessEmailSchema,
  grantAdminAccessSchema,
  updateAdminAccessSchema,
} from "@/lib/validations/admin-access";
import type { AdminScope } from "@/types/database";

const resolveScopes = (role: string, customScopes: AdminScope[], orgPortal: boolean): AdminScope[] => {
  const preset = ADMIN_ROLES.find((r) => r.key === role);
  const set = new Set(preset ? preset.scopes : customScopes);
  if (orgPortal) set.add("org_portal");
  return [...set];
};

export type AdminAccessActionState = { error?: string; success?: boolean };

/** Approved members only — no manual email/password account creation from here. */
export async function searchAdminMemberCandidatesAction(query: string) {
  await assertFullAdmin();
  if (query.trim().length < 2) return [];
  return searchApprovedMembersNotAdmin(query.trim());
}

export async function grantAdminAccessAction(
  _prev: AdminAccessActionState,
  formData: FormData,
): Promise<AdminAccessActionState> {
  try {
    await assertFullAdmin();
    const parsed = grantAdminAccessSchema.safeParse({
      memberId: formData.get("memberId"),
      role: formData.get("role"),
      scopes: formData.getAll("scopes"),
      orgPortal: formData.get("orgPortal") === "on",
      adminTitle: formData.get("adminTitle"),
    });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return { error: fieldErrors.memberId?.[0] ?? parsed.error.message };
    }
    const candidate = await getApprovedNonAdminProfile(parsed.data.memberId);
    if (!candidate) {
      return { error: "That member is no longer available — refresh and search again" };
    }
    await setProfileAdminAccess(candidate.id, {
      role: "admin",
      admin_scopes: resolveScopes(parsed.data.role, parsed.data.scopes, parsed.data.orgPortal),
      admin_title: parsed.data.adminTitle ?? null,
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
    revalidatePath(`/admin/access/${profile.id}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

/** Detail-page editor for one admin — own action, own state, isolated from every other admin's form. */
export async function updateAdminAccessByIdAction(
  _prev: AdminAccessActionState,
  formData: FormData,
): Promise<AdminAccessActionState> {
  try {
    const { user } = await assertFullAdmin();
    const profileId = formData.get("profileId")?.toString();
    if (!profileId) {
      return { error: "Missing account" };
    }
    const parsed = updateAdminAccessSchema
      .omit({ email: true })
      .safeParse({
        role: formData.get("role"),
        scopes: formData.getAll("scopes"),
        orgPortal: formData.get("orgPortal") === "on",
        adminTitle: formData.get("adminTitle"),
      });
    if (!parsed.success) {
      return { error: "Invalid input" };
    }
    const profile = await getProfileById(profileId);
    if (!profile) {
      return { error: "Account not found" };
    }
    if (profile.id === user.id) {
      return { error: "Your primary admin account cannot be changed here" };
    }
    await setProfileAdminAccess(profileId, {
      role: "admin",
      admin_scopes: resolveScopes(parsed.data.role, parsed.data.scopes, parsed.data.orgPortal),
      admin_title: parsed.data.adminTitle ?? null,
    });
    revalidatePath("/admin/access");
    revalidatePath(`/admin/access/${profileId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}
