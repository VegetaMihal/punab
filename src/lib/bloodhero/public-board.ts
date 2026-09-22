import { createClient } from "@supabase/supabase-js";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type PublicRequest = {
  id: string;
  blood_group: BloodGroup;
  request_quantity: number;
  district: string;
  donation_location: string;
  planned_donation_at: string;
  criticality: "normal" | "urgent" | "critical";
  status: "open" | "matching";
  created_at: string;
};

export type PublicStats = {
  active_donors: number;
  open_requests: number;
  fulfilled_requests: number;
};

/** Who can receive from each donor group (donor → recipients). */
export const CAN_DONATE_TO: Record<BloodGroup, readonly BloodGroup[]> = {
  "O-": BLOOD_GROUPS,
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

/** Cookie-less anon client so pages using it can be cached/ISR'd. */
function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const CRIT_RANK = { critical: 0, urgent: 1, normal: 2 } as const;

export async function fetchPublicRequests(filter?: {
  group?: string;
  district?: string;
}): Promise<PublicRequest[]> {
  const sb = anonClient();
  if (!sb) return [];
  let q = sb.from("bloodhero_public_requests").select("*").order("planned_donation_at", { ascending: true }).limit(200);
  if (filter?.group && (BLOOD_GROUPS as readonly string[]).includes(filter.group)) {
    q = q.eq("blood_group", filter.group);
  }
  if (filter?.district?.trim()) q = q.ilike("district", `%${filter.district.trim().slice(0, 60)}%`);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as PublicRequest[]).sort((a, b) => CRIT_RANK[a.criticality] - CRIT_RANK[b.criticality]);
}

export async function fetchPublicStats(): Promise<PublicStats | null> {
  const sb = anonClient();
  if (!sb) return null;
  const { data, error } = await sb.from("bloodhero_public_stats").select("*").maybeSingle();
  if (error || !data) return null;
  return data as PublicStats;
}
