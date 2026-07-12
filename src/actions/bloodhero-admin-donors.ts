"use server";

/**
 * BloodHero admin donor review — authorization matches BloodHero admin (`/bloodhero/admin`, `/admin/bloodhero`):
 * `canAccessBloodHeroAdmin` → Postgres `is_bloodhero_admin()` (PUNAB `profiles.role = admin` OR active
 * `bloodhero_admin_access` email). Listing uses RLS on `bloodhero_donors`; approve/reject uses RPC
 * `bloodhero_admin_review_donor` (same gate inside the function). Requires migrations **005**, **015**, **016**.
 */
import { canAccessBloodHeroAdmin } from "@/lib/bloodhero/is-bloodhero-admin";
import {
  BloodHeroSettingsError,
  getBloodHeroDonorAutoApprovalSetting,
  setBloodHeroDonorAutoApprovalSetting,
} from "@/lib/bloodhero/settings";
import { sendDonorApprovalWelcomeEmail } from "@/lib/bloodhero/donor-approval-welcome-email";
import {
  BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
  logBloodHeroEmailAttempt,
  logBloodHeroEmailResult,
  persistBloodHeroEmailEvent,
} from "@/lib/bloodhero/email-event-log";
import { revalidateBloodHeroAdminPendingDonorsAndOverview } from "@/lib/bloodhero/admin-paths";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type PendingDonorRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  blood_group: string;
  district: string;
  created_at: string;
};

const donorIdSchema = z.string().uuid("Invalid donor id");
const donorAutoApprovalEnabledSchema = z.enum(["true", "false"]);

export async function listPendingDonorsForAdmin(): Promise<{
  donors: PendingDonorRow[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { donors: [], error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("bloodhero_donors")
    .select("id, full_name, email, phone, blood_group, district, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return { donors: [], error: error.message };
  }

  return { donors: (data ?? []) as PendingDonorRow[] };
}

export type ReviewDonorState = { error?: string };
export type DonorAutoApprovalState = { error?: string; success?: boolean };
const BLOODHERO_AUTO_APPROVAL_LOAD_ERROR =
  "Auto approval settings are temporarily unavailable. Please try again shortly.";
const BLOODHERO_AUTO_APPROVAL_UPDATE_ERROR =
  "Could not save auto approval setting right now. Please try again.";

export async function bloodHeroAdminReviewDonor(
  _prev: ReviewDonorState,
  formData: FormData
): Promise<ReviewDonorState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { error: "Unauthorized" };
  }

  const idParsed = donorIdSchema.safeParse(formData.get("donorId")?.toString());
  if (!idParsed.success) {
    return { error: idParsed.error.flatten().formErrors[0] ?? "Invalid donor" };
  }

  const decision = formData.get("decision")?.toString();
  if (decision !== "approve" && decision !== "reject") {
    return { error: "Invalid action" };
  }

  const approving = decision === "approve";

  /**
   * Duplicate welcome emails are prevented by:
   * 1) Pre-check: row must be `status = 'pending'` or we return before RPC (already active/rejected → no RPC, no email).
   * 2) RPC: `UPDATE ... WHERE id = ? AND status = 'pending'` — at most one row transitions; concurrent approves race:
   *    one wins, the other gets row_count 0 and an error (no second email).
   * 3) Reject never enters the email path. There is no other app route that calls the welcome sender.
   */
  let welcomeTo: string | null = null;
  let welcomeName: string | null = null;
  if (approving) {
    const { data: pendingRow, error: pendingErr } = await supabase
      .from("bloodhero_donors")
      .select("id, email, full_name, status")
      .eq("id", idParsed.data)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingErr) {
      return { error: pendingErr.message };
    }
    if (!pendingRow) {
      return { error: "This donor is not pending approval." };
    }
    const emailTrim = pendingRow.email?.trim() ?? "";
    if (!emailTrim) {
      return {
        error:
          "Cannot approve: this donor has no email on file. Add an email in the database, then approve again.",
      };
    }
    welcomeTo = emailTrim;
    welcomeName = pendingRow.full_name?.trim() ?? null;
  }

  const { error } = await supabase.rpc("bloodhero_admin_review_donor", {
    p_donor_id: idParsed.data,
    p_approve: approving,
  });

  if (error) {
    return { error: error.message };
  }

  if (approving && welcomeTo) {
    const { data: activeCheck, error: activeErr } = await supabase
      .from("bloodhero_donors")
      .select("id, status")
      .eq("id", idParsed.data)
      .eq("status", "active")
      .maybeSingle();

    if (activeErr || !activeCheck) {
      console.error("[BloodHero] approve RPC reported success but donor is not active; skipping welcome email", {
        donorId: idParsed.data,
        message: activeErr?.message,
      });
      revalidateBloodHeroAdminPendingDonorsAndOverview();
      return {};
    }
    const donorId = idParsed.data;
    logBloodHeroEmailAttempt({
      donorId,
      emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
      recipient: welcomeTo,
    });

    const sent = await sendDonorApprovalWelcomeEmail(welcomeTo, {
      donorName: welcomeName || "there",
    });

    if (sent.ok) {
      logBloodHeroEmailResult({
        donorId,
        emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
        recipient: welcomeTo,
        status: "success",
      });
      await persistBloodHeroEmailEvent(supabase, {
        donorId,
        emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
        recipient: welcomeTo,
        status: "success",
      });
    } else {
      logBloodHeroEmailResult({
        donorId,
        emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
        recipient: welcomeTo,
        status: "failed",
        errorMessage: sent.reason,
      });
      await persistBloodHeroEmailEvent(supabase, {
        donorId,
        emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
        recipient: welcomeTo,
        status: "failed",
        errorMessage: sent.reason,
      });
    }
  }

  revalidateBloodHeroAdminPendingDonorsAndOverview();
  return {};
}

export async function getDonorAutoApprovalForAdmin(): Promise<{
  enabled: boolean;
  available: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { enabled: false, available: false, error: "Unauthorized" };
  }

  try {
    const enabled = await getBloodHeroDonorAutoApprovalSetting(supabase);
    return { enabled, available: true };
  } catch (e) {
    if (e instanceof BloodHeroSettingsError) {
      console.error("[BloodHero:auto-approval] load failed", { message: e.message });
      return { enabled: false, available: false, error: e.userMessage };
    }
    const msg = e instanceof Error ? e.message : "Failed to load auto approval setting.";
    console.error("[BloodHero:auto-approval] load failed", { message: msg });
    return { enabled: false, available: false, error: BLOODHERO_AUTO_APPROVAL_LOAD_ERROR };
  }
}

export async function updateDonorAutoApproval(
  _prev: DonorAutoApprovalState,
  formData: FormData
): Promise<DonorAutoApprovalState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { error: "Unauthorized" };
  }

  const parsed = donorAutoApprovalEnabledSchema.safeParse(
    formData.get("enabled")?.toString().trim().toLowerCase()
  );
  if (!parsed.success) {
    return { error: "Invalid auto approval value." };
  }
  const enabled = parsed.data === "true";

  try {
    await setBloodHeroDonorAutoApprovalSetting(supabase, enabled);
  } catch (e) {
    if (e instanceof BloodHeroSettingsError) {
      console.error("[BloodHero:auto-approval] update failed", { message: e.message, enabled });
      return { error: e.userMessage };
    }
    const msg = e instanceof Error ? e.message : "Failed to update auto approval setting.";
    console.error("[BloodHero:auto-approval] update failed", { message: msg, enabled });
    return { error: BLOODHERO_AUTO_APPROVAL_UPDATE_ERROR };
  }

  revalidateBloodHeroAdminPendingDonorsAndOverview();
  return { success: true };
}
