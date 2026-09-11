"use server";

import { assertFullAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  applyForPromotion,
  approvePromotionApplication,
  rejectPromotionApplication,
} from "@/lib/repositories/org-promotions-repository";
import { applyForPromotionSchema, decidePromotionSchema } from "@/lib/validations/org";
import { revalidatePath } from "next/cache";

export type PromotionActionState = { error?: string; success?: boolean };

/** PROMO-002: any logged-in member can apply for their own next level once eligible. */
export async function applyForPromotionAction(
  _prev: PromotionActionState,
  formData: FormData
): Promise<PromotionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please log in." };
  }

  const parsed = applyForPromotionSchema.safeParse({ forumId: formData.get("forumId") });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const result = await applyForPromotion({ memberId: user.id, forumId: parsed.data.forumId });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/me");
  revalidatePath("/portal/admin/promotions");
  return { success: true };
}

export async function approvePromotionAction(
  _prev: PromotionActionState,
  formData: FormData
): Promise<PromotionActionState> {
  let userId: string;
  try {
    const ctx = await assertFullAdmin();
    userId = ctx.user.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = decidePromotionSchema.safeParse({
    applicationId: formData.get("applicationId"),
    notes: formData.get("notes")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const result = await approvePromotionApplication({
    applicationId: parsed.data.applicationId,
    decidedBy: userId,
    notes: parsed.data.notes ?? null,
  });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/admin/promotions", "layout");
  return { success: true };
}

export async function rejectPromotionAction(
  _prev: PromotionActionState,
  formData: FormData
): Promise<PromotionActionState> {
  let userId: string;
  try {
    const ctx = await assertFullAdmin();
    userId = ctx.user.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = decidePromotionSchema.safeParse({
    applicationId: formData.get("applicationId"),
    notes: formData.get("notes")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const result = await rejectPromotionApplication({
    applicationId: parsed.data.applicationId,
    decidedBy: userId,
    notes: parsed.data.notes ?? null,
  });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/admin/promotions", "layout");
  return { success: true };
}
