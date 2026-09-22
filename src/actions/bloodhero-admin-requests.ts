"use server";

import { canAccessBloodHeroAdmin } from "@/lib/bloodhero/is-bloodhero-admin";
import { runBloodHeroMatchingForRequest } from "@/lib/bloodhero/matching";
import { sendBloodHeroDonorNotificationsForRequest } from "@/lib/bloodhero/send-donor-notifications";
import {
  revalidateBloodHeroAdminRequestDetail,
  revalidateBloodHeroAdminRequestsAndOverview,
} from "@/lib/bloodhero/admin-paths";
import { createClient } from "@/lib/supabase/server";
import type { BloodHeroCriticality } from "@/lib/bloodhero/classify-criticality";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type BloodHeroAdminRequestRow = {
  id: string;
  tracking_number: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  patient_name: string;
  patient_condition: string | null;
  condition_voice_transcript: string | null;
  condition_summary: string | null;
  condition_input_type: "text" | "voice";
  criticality: BloodHeroCriticality;
  criticality_source: "rules" | "ai" | "admin";
  escalation_count: number;
  escalation_paused: boolean;
  last_escalation_at: string | null;
  is_public: boolean;
  blood_group: string;
  district: string;
  donation_location: string;
  donation_location_address: string | null;
  donation_location_lat: number | null;
  donation_location_lng: number | null;
  planned_donation_at: string;
  request_quantity: number;
  status: "open" | "matching" | "fulfilled" | "cancelled";
  matched_notification_id: string | null;
  matched_at: string | null;
  donation_confirmed_at: string | null;
  created_at: string;
};

export type BloodHeroAcceptedNotificationRow = {
  id: string;
  donor_id: string;
  donor_full_name: string | null;
  donor_phone: string | null;
  responded_at: string | null;
};

export type BloodHeroRequestStatusFilter = "all" | "open" | "matching" | "fulfilled" | "closed";

const requestIdSchema = z.string().uuid("Invalid request id");
const requestStatusSchema = z.enum(["open", "matching", "fulfilled", "closed"]);
const requestConditionUpdateSchema = z.object({
  requestId: z.string().uuid("Invalid request id"),
  patient_condition: z.string().trim().max(1200, "Condition is too long").optional().default(""),
  condition_voice_transcript: z.string().trim().max(4000, "Voice transcript is too long").optional().default(""),
});

function mapFilterToDbStatus(filter: BloodHeroRequestStatusFilter): BloodHeroAdminRequestRow["status"] | null {
  if (filter === "all") return null;
  if (filter === "closed") return "cancelled";
  return filter;
}

export async function listBloodHeroRequestsForAdmin(filter: BloodHeroRequestStatusFilter): Promise<{
  requests: BloodHeroAdminRequestRow[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { requests: [], error: "Unauthorized" };
  }

  let q = supabase
    .from("bloodhero_requests")
    .select(
      "id, tracking_number, requester_name, requester_email, requester_phone, patient_name, patient_condition, condition_voice_transcript, condition_summary, condition_input_type, criticality, criticality_source, escalation_count, escalation_paused, last_escalation_at, is_public, blood_group, district, donation_location, donation_location_address, donation_location_lat, donation_location_lng, planned_donation_at, request_quantity, status, matched_notification_id, matched_at, donation_confirmed_at, created_at",
    )
    .order("created_at", { ascending: false });

  const dbStatus = mapFilterToDbStatus(filter);
  if (dbStatus) {
    q = q.eq("status", dbStatus);
  }

  const { data, error } = await q;
  if (error) {
    return { requests: [], error: error.message };
  }

  return { requests: (data ?? []) as BloodHeroAdminRequestRow[] };
}

export type UpdateBloodHeroRequestStatusState = { error?: string; success?: boolean };
export type UpdateBloodHeroRequestConditionState = { error?: string; success?: boolean };
export type RerunBloodHeroMatchingState = {
  error?: string;
  success?: boolean;
  inserted?: number;
  sent?: number;
};

export type BloodHeroRequestEventRow = {
  id: string;
  request_id: string;
  event_type: string;
  event_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export async function getBloodHeroRequestDetailForAdmin(requestId: string): Promise<{
  request: BloodHeroAdminRequestRow | null;
  events: BloodHeroRequestEventRow[];
  error?: string;
  eventsError?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { request: null, events: [], error: "Unauthorized" };
  }

  const idParsed = requestIdSchema.safeParse(requestId);
  if (!idParsed.success) {
    return { request: null, events: [], error: "Invalid request id" };
  }

  const { data, error } = await supabase
    .from("bloodhero_requests")
    .select(
      "id, tracking_number, requester_name, requester_email, requester_phone, patient_name, patient_condition, condition_voice_transcript, condition_summary, condition_input_type, criticality, criticality_source, escalation_count, escalation_paused, last_escalation_at, is_public, blood_group, district, donation_location, donation_location_address, donation_location_lat, donation_location_lng, planned_donation_at, request_quantity, status, matched_notification_id, matched_at, donation_confirmed_at, created_at",
    )
    .eq("id", idParsed.data)
    .maybeSingle();

  if (error) {
    return { request: null, events: [], error: error.message };
  }
  if (!data) {
    return { request: null, events: [], error: "Request not found" };
  }

  const detail = data as BloodHeroAdminRequestRow;

  // Optional timeline: do not fail request detail if events are unavailable.
  const eventsRes = await supabase
    .from("bloodhero_request_events")
    .select("id, request_id, event_type, event_message, metadata, created_at")
    .eq("request_id", detail.id)
    .order("created_at", { ascending: true });

  if (eventsRes.error) {
    console.warn("[BloodHero:requests] timeline load skipped", {
      requestId: detail.id,
      message: eventsRes.error.message,
    });
    return { request: detail, events: [], eventsError: "Timeline unavailable in this environment." };
  }

  return { request: detail, events: (eventsRes.data ?? []) as BloodHeroRequestEventRow[] };
}

export async function updateBloodHeroRequestStatus(
  _prev: UpdateBloodHeroRequestStatusState,
  formData: FormData,
): Promise<UpdateBloodHeroRequestStatusState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { error: "Unauthorized" };
  }

  const idParsed = requestIdSchema.safeParse(formData.get("requestId")?.toString());
  if (!idParsed.success) {
    return { error: idParsed.error.flatten().formErrors[0] ?? "Invalid request id" };
  }
  const statusParsed = requestStatusSchema.safeParse(formData.get("status")?.toString());
  if (!statusParsed.success) {
    return { error: "Invalid request status" };
  }

  const uiStatus = statusParsed.data;
  const dbStatus: BloodHeroAdminRequestRow["status"] = uiStatus === "closed" ? "cancelled" : uiStatus;

  const { error } = await supabase
    .from("bloodhero_requests")
    .update({ status: dbStatus })
    .eq("id", idParsed.data);

  if (error) {
    return { error: error.message };
  }

  // Optional event timeline integration (table introduced in migration 007).
  try {
    const { error: eventError } = await supabase.from("bloodhero_request_events").insert({
      request_id: idParsed.data,
      event_type: "request_status_changed",
      event_message: `Admin changed request status to ${uiStatus}.`,
      metadata: { to_status: uiStatus, source: "bloodhero_admin_requests" },
    });
    if (eventError) {
      console.warn("[BloodHero:requests] status event insert skipped", {
        message: eventError.message,
        requestId: idParsed.data,
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[BloodHero:requests] status event insert skipped", { message: msg, requestId: idParsed.data });
  }

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(idParsed.data);
  return { success: true };
}

export type UpdateBloodHeroRequestEscalationState = { success?: boolean; error?: string };

const criticalityOverrideSchema = z.object({
  requestId: z.string().uuid("Invalid request id"),
  criticality: z.enum(["normal", "urgent", "critical"]),
});

const escalationPauseSchema = z.object({
  requestId: z.string().uuid("Invalid request id"),
  paused: z.enum(["true", "false"]),
});

export async function overrideBloodHeroRequestCriticality(
  _prev: UpdateBloodHeroRequestEscalationState,
  formData: FormData,
): Promise<UpdateBloodHeroRequestEscalationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) return { error: "Unauthorized" };

  const parsed = criticalityOverrideSchema.safeParse({
    requestId: formData.get("requestId")?.toString(),
    criticality: formData.get("criticality")?.toString(),
  });
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? "Invalid form data" };

  const { error } = await supabase
    .from("bloodhero_requests")
    .update({
      criticality: parsed.data.criticality,
      criticality_source: "admin",
      criticality_overridden_by: user.id,
    })
    .eq("id", parsed.data.requestId);
  if (error) return { error: error.message };

  await supabase.from("bloodhero_request_events").insert({
    request_id: parsed.data.requestId,
    event_type: "criticality_overridden",
    event_message: `Admin set criticality to ${parsed.data.criticality}.`,
    metadata: { criticality: parsed.data.criticality },
  });

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(parsed.data.requestId);
  return { success: true };
}

export async function setBloodHeroRequestEscalationPaused(
  _prev: UpdateBloodHeroRequestEscalationState,
  formData: FormData,
): Promise<UpdateBloodHeroRequestEscalationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) return { error: "Unauthorized" };

  const parsed = escalationPauseSchema.safeParse({
    requestId: formData.get("requestId")?.toString(),
    paused: formData.get("paused")?.toString(),
  });
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? "Invalid form data" };

  const paused = parsed.data.paused === "true";
  const { error } = await supabase
    .from("bloodhero_requests")
    .update({ escalation_paused: paused })
    .eq("id", parsed.data.requestId);
  if (error) return { error: error.message };

  await supabase.from("bloodhero_request_events").insert({
    request_id: parsed.data.requestId,
    event_type: paused ? "escalation_paused" : "escalation_resumed",
    event_message: paused ? "Admin paused escalation." : "Admin resumed escalation.",
    metadata: { paused },
  });

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(parsed.data.requestId);
  return { success: true };
}

const publicVisibilitySchema = z.object({
  requestId: z.string().uuid("Invalid request id"),
  isPublic: z.enum(["true", "false"]),
});

/** Show/hide a request on the public "needed now" board (spam kill-switch). */
export async function setBloodHeroRequestPublic(
  _prev: UpdateBloodHeroRequestEscalationState,
  formData: FormData,
): Promise<UpdateBloodHeroRequestEscalationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) return { error: "Unauthorized" };

  const parsed = publicVisibilitySchema.safeParse({
    requestId: formData.get("requestId")?.toString(),
    isPublic: formData.get("isPublic")?.toString(),
  });
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? "Invalid form data" };

  const isPublic = parsed.data.isPublic === "true";
  const { error } = await supabase
    .from("bloodhero_requests")
    .update({ is_public: isPublic })
    .eq("id", parsed.data.requestId);
  if (error) return { error: error.message };

  await supabase.from("bloodhero_request_events").insert({
    request_id: parsed.data.requestId,
    event_type: isPublic ? "request_shown_public" : "request_hidden_public",
    event_message: isPublic ? "Admin showed request on public board." : "Admin hid request from public board.",
    metadata: { is_public: isPublic },
  });

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(parsed.data.requestId);
  revalidatePath("/bloodhero");
  revalidatePath("/bloodhero/requests");
  return { success: true };
}

export async function updateBloodHeroRequestCondition(
  _prev: UpdateBloodHeroRequestConditionState,
  formData: FormData,
): Promise<UpdateBloodHeroRequestConditionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { error: "Unauthorized" };
  }

  const parsed = requestConditionUpdateSchema.safeParse({
    requestId: formData.get("requestId")?.toString(),
    patient_condition: formData.get("patient_condition")?.toString(),
    condition_voice_transcript: formData.get("condition_voice_transcript")?.toString(),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid form data" };
  }

  const payload = parsed.data;
  const patientCondition = payload.patient_condition.length > 0 ? payload.patient_condition : null;
  const conditionVoiceTranscript =
    payload.condition_voice_transcript.length > 0 ? payload.condition_voice_transcript : null;

  const { error } = await supabase
    .from("bloodhero_requests")
    .update({
      patient_condition: patientCondition,
      condition_voice_transcript: conditionVoiceTranscript,
    })
    .eq("id", payload.requestId);
  if (error) {
    return { error: error.message };
  }

  try {
    const { error: eventError } = await supabase.from("bloodhero_request_events").insert({
      request_id: payload.requestId,
      event_type: "request_condition_updated",
      event_message: "Admin updated condition details.",
      metadata: {
        source: "bloodhero_admin_requests",
        has_voice_transcript: Boolean(conditionVoiceTranscript),
      },
    });
    if (eventError) {
      console.warn("[BloodHero:requests] condition event insert skipped", {
        message: eventError.message,
        requestId: payload.requestId,
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[BloodHero:requests] condition event insert skipped", {
      message: msg,
      requestId: payload.requestId,
    });
  }

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(payload.requestId);
  return { success: true };
}

export async function rerunBloodHeroMatchingForAdmin(
  _prev: RerunBloodHeroMatchingState,
  formData: FormData,
): Promise<RerunBloodHeroMatchingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { error: "Unauthorized" };
  }

  const idParsed = requestIdSchema.safeParse(formData.get("requestId")?.toString());
  if (!idParsed.success) {
    return { error: idParsed.error.flatten().formErrors[0] ?? "Invalid request id" };
  }

  const match = await runBloodHeroMatchingForRequest(idParsed.data);
  if (!match.ok) {
    return {
      error:
        process.env.NODE_ENV === "development" && match.detail
          ? `Matching failed: ${match.error} (${match.detail})`
          : "Matching could not be completed for this request.",
    };
  }

  let sent = 0;
  if (match.inserted > 0) {
    const notify = await sendBloodHeroDonorNotificationsForRequest(idParsed.data);
    sent = notify.sent;
    if (notify.errors.length > 0) {
      console.warn("[BloodHero:requests] rerun matching notification issues", {
        requestId: idParsed.data,
        errors: notify.errors,
      });
    }
  }

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(idParsed.data);
  return { success: true, inserted: match.inserted, sent };
}

/** Donors who accepted a notification for this request, for the admin to confirm a match against. */
export async function listBloodHeroAcceptedNotificationsForRequest(requestId: string): Promise<{
  notifications: BloodHeroAcceptedNotificationRow[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { notifications: [], error: "Unauthorized" };
  }

  const idParsed = requestIdSchema.safeParse(requestId);
  if (!idParsed.success) {
    return { notifications: [], error: "Invalid request id" };
  }

  const { data, error } = await supabase
    .from("bloodhero_request_notifications")
    .select("id, donor_id, responded_at, bloodhero_donors(full_name, phone)")
    .eq("request_id", idParsed.data)
    .eq("response_status", "accepted")
    .order("responded_at", { ascending: true });
  if (error) {
    return { notifications: [], error: error.message };
  }

  const rows = (data ?? []).map((n) => {
    const donor = n.bloodhero_donors as unknown as { full_name: string; phone: string } | null;
    return {
      id: n.id,
      donor_id: n.donor_id,
      donor_full_name: donor?.full_name ?? null,
      donor_phone: donor?.phone ?? null,
      responded_at: n.responded_at,
    } satisfies BloodHeroAcceptedNotificationRow;
  });

  return { notifications: rows };
}

export type ConfirmBloodHeroMatchState = { error?: string; success?: boolean };

const confirmMatchSchema = z.object({
  requestId: z.string().uuid("Invalid request id"),
  notificationId: z.string().uuid("Invalid notification id"),
});

/** Marks the request fulfilled and records which accepted donor the match is confirmed against. */
export async function confirmBloodHeroMatch(
  _prev: ConfirmBloodHeroMatchState,
  formData: FormData,
): Promise<ConfirmBloodHeroMatchState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) return { error: "Unauthorized" };

  const parsed = confirmMatchSchema.safeParse({
    requestId: formData.get("requestId")?.toString(),
    notificationId: formData.get("notificationId")?.toString(),
  });
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? "Invalid form data" };

  const { data: notification, error: notifError } = await supabase
    .from("bloodhero_request_notifications")
    .select("id, request_id, donor_id, response_status")
    .eq("id", parsed.data.notificationId)
    .maybeSingle();
  if (notifError) return { error: notifError.message };
  if (!notification || notification.request_id !== parsed.data.requestId) {
    return { error: "Notification does not belong to this request." };
  }
  if (notification.response_status !== "accepted") {
    return { error: "Only a donor who accepted can be confirmed as the match." };
  }

  const { error } = await supabase
    .from("bloodhero_requests")
    .update({
      status: "fulfilled",
      matched_notification_id: parsed.data.notificationId,
      matched_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.requestId);
  if (error) return { error: error.message };

  await supabase.from("bloodhero_request_events").insert({
    request_id: parsed.data.requestId,
    event_type: "match_confirmed",
    event_message: "Admin confirmed donor match; request marked fulfilled.",
    metadata: { notification_id: parsed.data.notificationId, donor_id: notification.donor_id },
  });

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(parsed.data.requestId);
  return { success: true };
}

/** Clears a confirmed match, e.g. if the donor no longer can give blood. */
export async function reopenBloodHeroMatch(
  _prev: ConfirmBloodHeroMatchState,
  formData: FormData,
): Promise<ConfirmBloodHeroMatchState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) return { error: "Unauthorized" };

  const idParsed = requestIdSchema.safeParse(formData.get("requestId")?.toString());
  if (!idParsed.success) return { error: idParsed.error.flatten().formErrors[0] ?? "Invalid request id" };

  const { data: existing, error: existingError } = await supabase
    .from("bloodhero_requests")
    .select("donation_confirmed_at")
    .eq("id", idParsed.data)
    .maybeSingle();
  if (existingError) return { error: existingError.message };
  if (existing?.donation_confirmed_at) {
    return { error: "Donation already confirmed for this match; it cannot be reopened." };
  }

  const { error } = await supabase
    .from("bloodhero_requests")
    .update({ status: "matching", matched_notification_id: null, matched_at: null })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };

  await supabase.from("bloodhero_request_events").insert({
    request_id: idParsed.data,
    event_type: "match_reopened",
    event_message: "Admin reopened request; match confirmation cleared.",
    metadata: {},
  });

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(idParsed.data);
  return { success: true };
}

export type BloodHeroCertificateRow = {
  id: string;
  certificate_number: string;
  request_id: string;
  donor_id: string;
  issued_at: string;
};

export type ConfirmBloodHeroDonationState = {
  error?: string;
  success?: boolean;
  certificateNumber?: string;
};

/** Confirms the matched donor actually donated, and issues a certificate for it. */
export async function confirmBloodHeroDonationCompleted(
  _prev: ConfirmBloodHeroDonationState,
  formData: FormData,
): Promise<ConfirmBloodHeroDonationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) return { error: "Unauthorized" };

  const idParsed = requestIdSchema.safeParse(formData.get("requestId")?.toString());
  if (!idParsed.success) return { error: idParsed.error.flatten().formErrors[0] ?? "Invalid request id" };

  const { data: request, error: requestError } = await supabase
    .from("bloodhero_requests")
    .select("id, status, matched_notification_id, donation_confirmed_at, tracking_number")
    .eq("id", idParsed.data)
    .maybeSingle();
  if (requestError) return { error: requestError.message };
  if (!request) return { error: "Request not found" };
  if (request.status !== "fulfilled" || !request.matched_notification_id) {
    return { error: "Confirm a donor match before recording the donation." };
  }
  if (request.donation_confirmed_at) {
    return { error: "Donation already confirmed for this request." };
  }

  const { data: notification, error: notifError } = await supabase
    .from("bloodhero_request_notifications")
    .select("donor_id")
    .eq("id", request.matched_notification_id)
    .maybeSingle();
  if (notifError) return { error: notifError.message };
  if (!notification) return { error: "Matched donor record is missing." };

  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("bloodhero_requests")
    .update({ donation_confirmed_at: nowIso, donation_confirmed_by: user.id })
    .eq("id", idParsed.data);
  if (updateError) return { error: updateError.message };

  const certificateNumber = `BH-${new Date().getFullYear()}-${request.tracking_number ?? idParsed.data.slice(0, 8).toUpperCase()}`;
  const { error: certError } = await supabase.from("bloodhero_certificates").insert({
    certificate_number: certificateNumber,
    request_id: idParsed.data,
    donor_id: notification.donor_id,
    issued_by: user.id,
  });
  if (certError) return { error: `Donation confirmed, but certificate issuance failed: ${certError.message}` };

  await supabase.from("bloodhero_request_events").insert({
    request_id: idParsed.data,
    event_type: "donation_confirmed",
    event_message: `Admin confirmed donation completed; certificate ${certificateNumber} issued.`,
    metadata: { certificate_number: certificateNumber, donor_id: notification.donor_id },
  });

  revalidateBloodHeroAdminRequestsAndOverview();
  revalidateBloodHeroAdminRequestDetail(idParsed.data);
  return { success: true, certificateNumber };
}

const certificateLookupSchema = z.object({
  certificateNumber: z.string().trim().min(3, "Enter a certificate number").max(80, "Certificate number is too long"),
});

export type BloodHeroCertificateVerifyResult = {
  found: boolean;
  error?: string;
  certificateNumber?: string;
  issuedAt?: string;
  donorFirstName?: string;
  bloodGroup?: string;
  district?: string;
  trackingNumber?: string;
};

/** Public certificate verification: number in, minimal donor-identifying details out (no PII beyond first name). */
export async function verifyBloodHeroCertificate(certificateNumber: string): Promise<BloodHeroCertificateVerifyResult> {
  const parsed = certificateLookupSchema.safeParse({ certificateNumber });
  if (!parsed.success) {
    return { found: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid certificate number" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bloodhero_certificates")
    .select(
      "certificate_number, issued_at, bloodhero_donors(full_name), bloodhero_requests(blood_group, district, tracking_number)",
    )
    .eq("certificate_number", parsed.data.certificateNumber.trim())
    .maybeSingle();

  if (error) return { found: false, error: "Could not verify right now. Try again shortly." };
  if (!data) return { found: false, error: "No certificate found with that number." };

  const donor = data.bloodhero_donors as unknown as { full_name: string } | null;
  const request = data.bloodhero_requests as unknown as {
    blood_group: string;
    district: string;
    tracking_number: string;
  } | null;
  const firstName = donor?.full_name?.trim().split(/\s+/)[0] ?? null;

  return {
    found: true,
    certificateNumber: data.certificate_number,
    issuedAt: data.issued_at,
    donorFirstName: firstName ?? undefined,
    bloodGroup: request?.blood_group,
    district: request?.district,
    trackingNumber: request?.tracking_number,
  };
}
