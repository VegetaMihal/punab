/**
 * BloodHero email audit: structured console + optional `bloodhero_email_events` row (server-only).
 * Inserts never throw; failures are logged so donor approval is never blocked.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME = "donor_approval_welcome" as const;

export type BloodHeroEmailEventStatus = "success" | "failed";

type ResultPayload = {
  donorId: string;
  emailType: string;
  recipient: string;
  status: BloodHeroEmailEventStatus;
  errorMessage?: string | null;
};

/** Console prefix for filtering in Vercel / Docker / local dev. */
const LOG_PREFIX = "[BloodHero:email]";

/** Logs that a send was attempted (before calling Resend). */
export function logBloodHeroEmailAttempt(params: {
  donorId: string;
  emailType: string;
  recipient: string;
}): void {
  console.info(
    LOG_PREFIX,
    JSON.stringify({
      scope: "BloodHero",
      phase: "attempt",
      email: {
        type: params.emailType,
        donorId: params.donorId,
        recipient: params.recipient,
      },
    }),
  );
}

/** Logs final outcome (after Resend). success → info; failed → warn. */
export function logBloodHeroEmailResult(payload: ResultPayload): void {
  const line = JSON.stringify({
    scope: "BloodHero",
    phase: "result",
    email: {
      type: payload.emailType,
      status: payload.status,
      donorId: payload.donorId,
      recipient: payload.recipient,
      ...(payload.errorMessage ? { error: payload.errorMessage } : {}),
    },
  });
  if (payload.status === "success") {
    console.info(LOG_PREFIX, line);
  } else {
    console.warn(LOG_PREFIX, line);
  }
}

/**
 * Persists one row to `bloodhero_email_events` (migration 017). Swallows errors.
 */
export async function persistBloodHeroEmailEvent(
  supabase: SupabaseClient,
  payload: ResultPayload
): Promise<void> {
  try {
    const { error } = await supabase.from("bloodhero_email_events").insert({
      donor_id: payload.donorId,
      email_type: payload.emailType,
      recipient: payload.recipient,
      status: payload.status,
      error_message: payload.errorMessage ?? null,
    });
    if (error) {
      console.error(LOG_PREFIX, "persist failed", JSON.stringify({ message: error.message, donorId: payload.donorId }));
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(LOG_PREFIX, "persist exception", JSON.stringify({ message: msg, donorId: payload.donorId }));
  }
}
