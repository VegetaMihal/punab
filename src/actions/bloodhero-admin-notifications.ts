"use server";

import { canAccessBloodHeroAdmin } from "@/lib/bloodhero/is-bloodhero-admin";
import { createClient } from "@/lib/supabase/server";

export type BloodHeroNotificationStatusFilter = "all" | "pending" | "accepted" | "declined" | "expired";

export type BloodHeroAdminNotificationRow = {
  id: string;
  request_id: string;
  donor_id: string;
  sent_at: string | null;
  response_status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
  request_tracking_number: string | null;
  request_blood_group: string | null;
  request_district: string | null;
  donor_full_name: string | null;
  donor_phone: string | null;
};

export async function listBloodHeroNotificationsForAdmin(
  filter: BloodHeroNotificationStatusFilter,
): Promise<{ notifications: BloodHeroAdminNotificationRow[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { notifications: [], error: "Unauthorized" };
  }

  let q = supabase
    .from("bloodhero_request_notifications")
    .select(
      "id, request_id, donor_id, sent_at, response_status, created_at, bloodhero_requests(tracking_number, blood_group, district), bloodhero_donors(full_name, phone)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter !== "all") {
    q = q.eq("response_status", filter);
  }

  const { data, error } = await q;
  if (error) {
    return { notifications: [], error: error.message };
  }

  const rows = (data ?? []).map((n) => {
    // assumed: Supabase returns joined tables as single objects for to-one FK relations
    const req = n.bloodhero_requests as unknown as {
      tracking_number: string;
      blood_group: string;
      district: string;
    } | null;
    const donor = n.bloodhero_donors as unknown as { full_name: string; phone: string } | null;
    return {
      id: n.id,
      request_id: n.request_id,
      donor_id: n.donor_id,
      sent_at: n.sent_at,
      response_status: n.response_status,
      created_at: n.created_at,
      request_tracking_number: req?.tracking_number ?? null,
      request_blood_group: req?.blood_group ?? null,
      request_district: req?.district ?? null,
      donor_full_name: donor?.full_name ?? null,
      donor_phone: donor?.phone ?? null,
    } satisfies BloodHeroAdminNotificationRow;
  });

  return { notifications: rows };
}
