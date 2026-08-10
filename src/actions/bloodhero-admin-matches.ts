"use server";

import { canAccessBloodHeroAdmin } from "@/lib/bloodhero/is-bloodhero-admin";
import { createClient } from "@/lib/supabase/server";

export type BloodHeroAdminMatchRow = {
  id: string;
  request_id: string;
  donor_id: string;
  created_at: string;
  request_tracking_number: string | null;
  request_status: string | null;
  request_blood_group: string | null;
  request_district: string | null;
  donor_full_name: string | null;
  donor_phone: string | null;
};

/** Accepted donor–request notifications, i.e. confirmed matches. */
export async function listBloodHeroMatchesForAdmin(): Promise<{
  matches: BloodHeroAdminMatchRow[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await canAccessBloodHeroAdmin(supabase))) {
    return { matches: [], error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("bloodhero_request_notifications")
    .select(
      "id, request_id, donor_id, created_at, bloodhero_requests(tracking_number, status, blood_group, district), bloodhero_donors(full_name, phone)",
    )
    .eq("response_status", "accepted")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return { matches: [], error: error.message };
  }

  const rows = (data ?? []).map((m) => {
    // assumed: Supabase returns joined tables as single objects for to-one FK relations
    const req = m.bloodhero_requests as unknown as {
      tracking_number: string;
      status: string;
      blood_group: string;
      district: string;
    } | null;
    const donor = m.bloodhero_donors as unknown as { full_name: string; phone: string } | null;
    return {
      id: m.id,
      request_id: m.request_id,
      donor_id: m.donor_id,
      created_at: m.created_at,
      request_tracking_number: req?.tracking_number ?? null,
      request_status: req?.status ?? null,
      request_blood_group: req?.blood_group ?? null,
      request_district: req?.district ?? null,
      donor_full_name: donor?.full_name ?? null,
      donor_phone: donor?.phone ?? null,
    } satisfies BloodHeroAdminMatchRow;
  });

  return { matches: rows };
}
