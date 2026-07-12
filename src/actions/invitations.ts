"use server";

import { revalidatePath } from "next/cache";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { julyMemorialInvitationResponseStatusSchema } from "@/lib/invitations/july-memorial-schema";
import { updateJulyMemorialInvitationResponseStatus } from "@/lib/repositories/july-memorial-invitations-repository";

export type InvitationActionState = { error?: string; success?: boolean };

export async function updateJulyMemorialInvitationStatus(
  id: string,
  responseStatus: string,
): Promise<InvitationActionState> {
  try {
    await assertAdminScope("invitations");
    const parsed = julyMemorialInvitationResponseStatusSchema.safeParse(responseStatus);
    if (!parsed.success) {
      return { error: "Invalid status" };
    }
    const updated = await updateJulyMemorialInvitationResponseStatus(id, parsed.data);
    if (!updated) {
      return { error: "Invitation not found" };
    }
    revalidatePath("/admin/invitations");
    revalidatePath(`/admin/invitations/${id}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}
