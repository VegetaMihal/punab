"use server";

import { revalidatePath } from "next/cache";
import { assertFullAdmin } from "@/lib/auth/require-admin";
import {
  getApprovedNonAdminProfile,
  getProfileByEmail,
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

const scopesFromForm = (
  invitations: boolean,
  certificates: boolean,
  julyAwardCards: boolean,
  julyAwardParticipants: boolean,
  orgPortal: boolean
): AdminScope[] => {
  const scopes: AdminScope[] = [];
  if (invitations) scopes.push("invitations");
  if (certificates) scopes.push("certificates");
  if (julyAwardCards) scopes.push("july_award_cards");
  if (julyAwardParticipants) scopes.push("july_award_participants");
  if (orgPortal) scopes.push("org_portal");
  return scopes;
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
      invitations: formData.get("invitations") === "on",
      certificates: formData.get("certificates") === "on",
      julyAwardCards: formData.get("julyAwardCards") === "on",
      julyAwardParticipants: formData.get("julyAwardParticipants") === "on",
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
      admin_scopes: scopesFromForm(
        parsed.data.invitations,
        parsed.data.certificates,
        parsed.data.julyAwardCards,
        parsed.data.julyAwardParticipants,
        parsed.data.orgPortal
      ),
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
      orgPortal: formData.get("orgPortal") === "on",
      adminTitle: formData.get("adminTitle"),
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
        parsed.data.julyAwardParticipants,
        parsed.data.orgPortal
      ),
      admin_title: parsed.data.adminTitle ?? null,
    });
    revalidatePath("/admin/access");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}
