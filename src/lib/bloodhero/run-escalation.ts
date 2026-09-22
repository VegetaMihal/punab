/**
 * BloodHero escalation (server-only): follow-up matching rounds for requests still waiting on donors.
 * Each round re-runs matching (already-notified donors are excluded, so it adds the next batch)
 * and emails the new donors. Cadence comes from criticality (escalation-config.ts).
 */
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { runBloodHeroMatchingForRequest } from "@/lib/bloodhero/matching";
import { sendBloodHeroDonorNotificationsForRequest } from "@/lib/bloodhero/send-donor-notifications";
import { ESCALATION_CONFIG } from "@/lib/bloodhero/escalation-config";
import type { BloodHeroCriticality } from "@/lib/bloodhero/classify-criticality";

export type EscalationRequestRow = {
  id: string;
  status: string;
  criticality: BloodHeroCriticality;
  request_quantity: number;
  created_at: string;
  last_escalation_at: string | null;
  escalation_count: number;
  escalation_paused: boolean;
};

export type EscalationDecision =
  | { run: true }
  | { run: false; reason: "closed" | "paused" | "fulfilled_by_accepts" | "max_rounds" | "not_due" };

/** Pure: decides whether a request is due for another round. */
export function decideEscalation(
  row: EscalationRequestRow,
  acceptedCount: number,
  now: Date = new Date()
): EscalationDecision {
  if (row.status !== "open" && row.status !== "matching") return { run: false, reason: "closed" };
  if (row.escalation_paused) return { run: false, reason: "paused" };
  if (acceptedCount >= row.request_quantity) return { run: false, reason: "fulfilled_by_accepts" };

  const rule = ESCALATION_CONFIG[row.criticality] ?? ESCALATION_CONFIG.normal;
  if (row.escalation_count >= rule.maxRounds) return { run: false, reason: "max_rounds" };

  const baseline = Date.parse(row.last_escalation_at ?? row.created_at);
  if (!Number.isFinite(baseline)) return { run: false, reason: "not_due" };
  const dueAt = baseline + rule.intervalMinutes * 60_000;
  return now.getTime() >= dueAt ? { run: true } : { run: false, reason: "not_due" };
}

export type EscalationRunResult =
  | { ok: true; requestId: string; ran: false; reason: string }
  | { ok: true; requestId: string; ran: true; round: number; newDonors: number; emailsSent: number }
  | { ok: false; requestId: string; error: string };

const REQUEST_COLUMNS =
  "id,status,criticality,request_quantity,created_at,last_escalation_at,escalation_count,escalation_paused";

async function runForRow(
  supabase: ReturnType<typeof createServiceRoleSupabase>,
  row: EscalationRequestRow,
  now: Date
): Promise<EscalationRunResult> {
  const { count, error: acceptedError } = await supabase
    .from("bloodhero_request_notifications")
    .select("id", { count: "exact", head: true })
    .eq("request_id", row.id)
    .eq("response_status", "accepted");
  if (acceptedError) return { ok: false, requestId: row.id, error: acceptedError.message };

  const decision = decideEscalation(row, count ?? 0, now);
  if (!decision.run) return { ok: true, requestId: row.id, ran: false, reason: decision.reason };

  // Claim the round first so overlapping cron runs cannot double-send.
  const round = row.escalation_count + 1;
  let claim = supabase
    .from("bloodhero_requests")
    .update({ escalation_count: round, last_escalation_at: now.toISOString() })
    .eq("id", row.id)
    .eq("escalation_count", row.escalation_count);
  claim = row.last_escalation_at
    ? claim.eq("last_escalation_at", row.last_escalation_at)
    : claim.is("last_escalation_at", null);
  const { data: claimed, error: claimError } = await claim.select("id");
  if (claimError) return { ok: false, requestId: row.id, error: claimError.message };
  if (!claimed || claimed.length === 0) {
    return { ok: true, requestId: row.id, ran: false, reason: "claimed_elsewhere" };
  }

  const match = await runBloodHeroMatchingForRequest(row.id);
  if (!match.ok) return { ok: false, requestId: row.id, error: match.detail ?? match.error };

  let emailsSent = 0;
  if (match.inserted > 0) {
    const sent = await sendBloodHeroDonorNotificationsForRequest(row.id);
    emailsSent = sent.sent;
  }

  await supabase.from("bloodhero_request_events").insert({
    request_id: row.id,
    event_type: "escalation_round",
    event_message: `Escalation round ${round}: ${match.inserted} more donors contacted.`,
    metadata: {
      round,
      criticality: row.criticality,
      new_donors: match.inserted,
      emails_sent: emailsSent,
    },
  });

  return { ok: true, requestId: row.id, ran: true, round, newDonors: match.inserted, emailsSent };
}

export async function runEscalationForRequest(requestId: string): Promise<EscalationRunResult> {
  let supabase;
  try {
    supabase = createServiceRoleSupabase();
  } catch {
    return { ok: false, requestId, error: "missing_env" };
  }
  const { data, error } = await supabase
    .from("bloodhero_requests")
    .select(REQUEST_COLUMNS)
    .eq("id", requestId)
    .maybeSingle();
  if (error || !data) return { ok: false, requestId, error: error?.message ?? "request_not_found" };
  return runForRow(supabase, data as EscalationRequestRow, new Date());
}

export async function runEscalationSweep(): Promise<{
  checked: number;
  ran: number;
  results: EscalationRunResult[];
  error?: string;
}> {
  let supabase;
  try {
    supabase = createServiceRoleSupabase();
  } catch {
    return { checked: 0, ran: 0, results: [], error: "missing_env" };
  }
  const { data, error } = await supabase
    .from("bloodhero_requests")
    .select(REQUEST_COLUMNS)
    .in("status", ["open", "matching"])
    .eq("escalation_paused", false);
  if (error) return { checked: 0, ran: 0, results: [], error: error.message };

  const now = new Date();
  const results: EscalationRunResult[] = [];
  for (const row of (data ?? []) as EscalationRequestRow[]) {
    results.push(await runForRow(supabase, row, now));
  }
  return {
    checked: results.length,
    ran: results.filter((r) => r.ok && r.ran).length,
    results,
  };
}
