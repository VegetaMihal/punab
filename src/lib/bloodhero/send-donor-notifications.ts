/**
 * Queue processor: send Resend emails for unsent bloodhero_request_notifications rows (server-only).
 */
import { sendDonorMatchEmail, type DonorMatchEmailContext } from "@/lib/bloodhero/donor-notification-email";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

type QueueRow = {
  id: string;
  bloodhero_donors: { email: string; full_name: string } | null;
  bloodhero_requests: {
    blood_group: string;
    district: string;
    donation_location: string;
    planned_donation_at: string;
    tracking_number: string;
  } | null;
};

function unwrapEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function normalizeQueueRow(raw: {
  id: string;
  bloodhero_donors?: unknown;
  bloodhero_requests?: unknown;
}): QueueRow {
  return {
    id: raw.id,
    bloodhero_donors: unwrapEmbed(
      raw.bloodhero_donors as { email: string; full_name: string } | null
    ),
    bloodhero_requests: unwrapEmbed(
      raw.bloodhero_requests as {
        blood_group: string;
        district: string;
        donation_location: string;
        planned_donation_at: string;
        tracking_number: string;
      } | null
    ),
  };
}

export type SendDonorNotificationsResult = {
  sent: number;
  skipped: number;
  errors: string[];
};

/**
 * Sends one email per pending unsent notification for the request, then sets sent_at.
 * Safe to call multiple times; only rows with sent_at IS NULL are processed.
 */
export async function sendBloodHeroDonorNotificationsForRequest(
  requestId: string
): Promise<SendDonorNotificationsResult> {
  const errors: string[] = [];
  let sent = 0;
  let skipped = 0;

  if (!process.env.RESEND_API_KEY?.trim()) {
    return { sent: 0, skipped: 0, errors: ["RESEND_API_KEY is not set — donor emails skipped."] };
  }

  let supabase;
  try {
    supabase = createServiceRoleSupabase();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "service_role_unavailable";
    return { sent: 0, skipped: 0, errors: [msg] };
  }

  const { data, error } = await supabase
    .from("bloodhero_request_notifications")
    .select(
      `
      id,
      bloodhero_donors!inner ( email, full_name ),
      bloodhero_requests!inner ( blood_group, district, donation_location, planned_donation_at, tracking_number )
    `
    )
    .eq("request_id", requestId)
    .is("sent_at", null)
    .eq("response_status", "pending");

  if (error) {
    return { sent: 0, skipped: 0, errors: [error.message] };
  }

  const rows = (data ?? []).map((r) =>
    normalizeQueueRow(r as { id: string; bloodhero_donors?: unknown; bloodhero_requests?: unknown })
  );

  for (const row of rows) {
    const donor = row.bloodhero_donors;
    const req = row.bloodhero_requests;
    if (!donor?.email || !req) {
      skipped++;
      errors.push(`skip_notification_${row.id}: missing donor or request embed`);
      continue;
    }

    const ctx: DonorMatchEmailContext = {
      donorName: donor.full_name || "Donor",
      notificationId: row.id,
      bloodGroup: req.blood_group,
      district: req.district,
      donationLocation: req.donation_location,
      plannedDonationAt: req.planned_donation_at,
      trackingNumber: req.tracking_number,
    };

    try {
      await sendDonorMatchEmail(donor.email.trim(), ctx);
      const sentAt = new Date().toISOString();
      const { error: upErr } = await supabase
        .from("bloodhero_request_notifications")
        .update({ sent_at: sentAt })
        .eq("id", row.id)
        .is("sent_at", null);

      if (upErr) {
        errors.push(`sent_but_update_failed ${row.id}: ${upErr.message}`);
      } else {
        sent++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`send_failed ${row.id}: ${msg}`);
    }
  }

  return { sent, skipped, errors };
}
