"use server";

import { canAccessBloodHeroAdmin } from "@/lib/bloodhero/is-bloodhero-admin";
import { runBloodHeroMatchingForRequest } from "@/lib/bloodhero/matching";
import { sendBloodHeroDonorNotificationsForRequest } from "@/lib/bloodhero/send-donor-notifications";
import {
  revalidateBloodHeroAdminRequestDetail,
  revalidateBloodHeroAdminRequestsAndOverview,
} from "@/lib/bloodhero/admin-paths";
import { createClient } from "@/lib/supabase/server";
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
  blood_group: string;
  district: string;
  donation_location: string;
  donation_location_address: string | null;
  donation_location_lat: number | null;
  donation_location_lng: number | null;
  planned_donation_at: string;
  request_quantity: number;
  status: "open" | "matching" | "fulfilled" | "cancelled";
  created_at: string;
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
      "id, tracking_number, requester_name, requester_email, requester_phone, patient_name, patient_condition, condition_voice_transcript, blood_group, district, donation_location, donation_location_address, donation_location_lat, donation_location_lng, planned_donation_at, request_quantity, status, created_at",
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
      "id, tracking_number, requester_name, requester_email, requester_phone, patient_name, patient_condition, condition_voice_transcript, blood_group, district, donation_location, donation_location_address, donation_location_lat, donation_location_lng, planned_donation_at, request_quantity, status, created_at",
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
