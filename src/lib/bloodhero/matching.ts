/**
 * BloodHero donor matching (server-only).
 *
 * Calls Postgres `bloodhero_run_matching_for_request` (SECURITY DEFINER) which:
 * - finds eligible donors (active, same blood group, block clear, not already queued)
 * - can use location fields when present (request donation lat/lng + donor center lat/lng)
 * - replaces pending unsent notification rows and inserts up to 15 donors
 *
 * Requires `SUPABASE_SERVICE_ROLE_KEY` (server env only — never expose to the client).
 */
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { BLOODHERO_MAX_MATCH_RADIUS_KM, haversineDistanceKm } from "@/lib/bloodhero/distance";

export type BloodHeroMatchingRunResult =
  | {
      ok: true;
      requestId: string;
      inserted: number;
      trackingNumber: string | null;
    }
  | { ok: false; error: string; detail?: string };

type RequestRow = {
  id: string;
  tracking_number: string | null;
  blood_group: string;
  district: string | null;
  donation_location_lat: number | null;
  donation_location_lng: number | null;
  status: "open" | "matching" | "fulfilled" | "cancelled";
};

type DonorRow = {
  id: string;
  district: string | null;
  block_until: string | null;
  center_point_lat: number | null;
  center_point_lng: number | null;
  created_at: string;
};

export async function runBloodHeroMatchingForRequest(
  requestId: string
): Promise<BloodHeroMatchingRunResult> {
  let supabase;
  try {
    supabase = createServiceRoleSupabase();
  } catch {
    return {
      ok: false,
      error: "missing_env",
      detail: "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for matching runs.",
    };
  }

  const { data: reqData, error: reqError } = await supabase
    .from("bloodhero_requests")
    .select("id,tracking_number,blood_group,district,donation_location_lat,donation_location_lng,status")
    .eq("id", requestId)
    .maybeSingle();
  if (reqError || !reqData) {
    return {
      ok: false,
      error: "request_not_found",
      detail: reqError?.message ?? "request_not_found",
    };
  }

  const req = reqData as RequestRow;
  if (req.status !== "open" && req.status !== "matching") {
    return {
      ok: true,
      requestId: req.id,
      inserted: 0,
      trackingNumber: req.tracking_number,
    };
  }

  const nowIso = new Date().toISOString();
  const { data: donorData, error: donorError } = await supabase
    .from("bloodhero_donors")
    .select("id,district,block_until,center_point_lat,center_point_lng,created_at")
    .in("status", ["active", "approved"])
    .eq("blood_group", req.blood_group)
    .or(`block_until.is.null,block_until.lte.${nowIso}`);
  if (donorError) {
    return { ok: false, error: "donor_lookup_failed", detail: donorError.message };
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("bloodhero_request_notifications")
    .select("donor_id")
    .eq("request_id", requestId);
  if (existingError) {
    return { ok: false, error: "existing_lookup_failed", detail: existingError.message };
  }
  const alreadyNotified = new Set((existingRows ?? []).map((x) => String(x.donor_id)));

  const district = String(req.district ?? "").trim().toLowerCase();
  const hasRequestCoords =
    typeof req.donation_location_lat === "number" && typeof req.donation_location_lng === "number";
  const ranked = (donorData ?? [])
    .map((d) => {
      const donor = d as DonorRow;
      const hasDonorCoords =
        typeof donor.center_point_lat === "number" && typeof donor.center_point_lng === "number";
      const distanceKm =
        hasRequestCoords && hasDonorCoords
          ? haversineDistanceKm(
              { lat: req.donation_location_lat as number, lng: req.donation_location_lng as number },
              { lat: donor.center_point_lat as number, lng: donor.center_point_lng as number }
            )
          : null;
      const districtMatch = district && donor.district
        ? donor.district.trim().toLowerCase() === district
        : false;
      return { donor, distanceKm, districtMatch };
    })
    .filter((x) => !alreadyNotified.has(x.donor.id))
    .filter((x) => x.distanceKm === null || x.distanceKm <= BLOODHERO_MAX_MATCH_RADIUS_KM)
    .sort((a, b) => {
      // Same order as SQL 025/027: never-blocked donors first, then distance, district fallback, signup.
      const aBlocked = a.donor.block_until !== null;
      const bBlocked = b.donor.block_until !== null;
      if (aBlocked !== bBlocked) return aBlocked ? 1 : -1;
      if (aBlocked && bBlocked) {
        const diff = Date.parse(a.donor.block_until as string) - Date.parse(b.donor.block_until as string);
        if (diff !== 0) return diff;
      }
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      if (a.districtMatch && !b.districtMatch) return -1;
      if (!a.districtMatch && b.districtMatch) return 1;
      return Date.parse(a.donor.created_at) - Date.parse(b.donor.created_at);
    })
    .slice(0, 15);
  const selectedPreview = ranked.slice(0, 5).map((x, idx) => ({
    donor_id: x.donor.id,
    rank: idx + 1,
    distance_km: x.distanceKm === null ? null : Math.round(x.distanceKm * 100) / 100,
    district_match_fallback: x.distanceKm === null ? x.districtMatch : false,
  }));
  const donorsWithCoordinates = (donorData ?? []).filter(
    (d) => typeof d.center_point_lat === "number" && typeof d.center_point_lng === "number"
  ).length;

  const { error: cleanupError } = await supabase
    .from("bloodhero_request_notifications")
    .delete()
    .eq("request_id", requestId)
    .is("sent_at", null)
    .eq("response_status", "pending");
  if (cleanupError) {
    return { ok: false, error: "cleanup_failed", detail: cleanupError.message };
  }

  let inserted = 0;
  if (ranked.length > 0) {
    const payload = ranked.map((x) => ({ request_id: requestId, donor_id: x.donor.id }));
    const { error: insErr } = await supabase.from("bloodhero_request_notifications").insert(payload);
    if (insErr) {
      return { ok: false, error: "insert_failed", detail: insErr.message };
    }
    inserted = ranked.length;
  }

  if (inserted > 0 && req.status === "open") {
    await supabase.from("bloodhero_requests").update({ status: "matching" }).eq("id", requestId);
  }

  await supabase.from("bloodhero_request_events").insert([
    {
      request_id: requestId,
      event_type: "donor_matching_started",
      event_message: "Donor matching started for this request.",
      metadata: {
        request_id: requestId,
        request_has_coordinates: hasRequestCoords,
        donor_pool_total: (donorData ?? []).length,
        donor_pool_with_coordinates: donorsWithCoordinates,
      },
    },
    {
      request_id: requestId,
      event_type: "donors_selected_for_notification",
      event_message: `${inserted} donors selected for notification.`,
      metadata: {
        selected_count: inserted,
        request_has_coordinates: hasRequestCoords,
        donor_pool_total: (donorData ?? []).length,
        donor_pool_with_coordinates: donorsWithCoordinates,
        selected_preview: selectedPreview,
      },
    },
  ]);

  return {
    ok: true,
    requestId: req.id,
    inserted,
    trackingNumber: req.tracking_number,
  };
}
