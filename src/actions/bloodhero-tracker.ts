"use server";

/**
 * BloodHero tracker lookup — RPC-only read by public tracking_number (no broad SELECT on requests).
 */
import { createClient } from "@/lib/supabase/server";
import type {
  BloodHeroTrackerEventRow,
  BloodHeroTrackerRequestRow,
} from "@/lib/bloodhero/tracker-types";
import {
  bloodHeroTrackerFieldErrors,
  bloodHeroTrackerLookupSchema,
  parseBloodHeroTrackerFormData,
} from "@/lib/validations/bloodhero-tracker";

export type { BloodHeroTrackerEventRow, BloodHeroTrackerRequestRow } from "@/lib/bloodhero/tracker-types";

export type BloodHeroTrackerActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: {
    trackingNumberUsed: string;
    request: BloodHeroTrackerRequestRow | null;
    events: BloodHeroTrackerEventRow[];
  };
};

function isMissingTrackerRpcError(err: { message?: string } | null): boolean {
  const m = (err?.message ?? "").toLowerCase();
  return (
    (m.includes("bloodhero_tracker") && (m.includes("does not exist") || m.includes("not found"))) ||
    (m.includes("function") && m.includes("not found"))
  );
}

export async function lookupBloodHeroTracker(
  _prev: BloodHeroTrackerActionState,
  formData: FormData
): Promise<BloodHeroTrackerActionState> {
  try {
    const raw = parseBloodHeroTrackerFormData(formData);
    const parsed = bloodHeroTrackerLookupSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        fieldErrors: bloodHeroTrackerFieldErrors(parsed.error),
      };
    }

    const trackingNorm = parsed.data.tracking_number;

    let supabase: Awaited<ReturnType<typeof createClient>>;
    try {
      supabase = await createClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const missingEnv =
        msg.includes("NEXT_PUBLIC_SUPABASE_URL") ||
        msg.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
        msg.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
      return {
        error: missingEnv
          ? "The tracker is not available right now (server configuration). Please try again later."
          : "We could not connect to our services. Please try again in a moment.",
      };
    }

    const { data: reqData, error: reqErr } = await supabase.rpc("bloodhero_tracker_by_tracking_number", {
      p_tracking_number: trackingNorm,
    });

    if (reqErr) {
      if (isMissingTrackerRpcError(reqErr)) {
        return {
          error:
            process.env.NODE_ENV === "development"
              ? "Tracker RPC missing — apply supabase/migrations/009_bloodhero_tracking_number.sql in Supabase (and prior BloodHero migrations)."
              : "The tracker is temporarily unavailable. Please try again later.",
        };
      }
      return {
        error:
          reqErr.message ||
          "We could not look up your request. Please try again in a moment.",
      };
    }

    const rows = (reqData ?? []) as BloodHeroTrackerRequestRow[];
    const request = rows[0] ?? null;

    let events: BloodHeroTrackerEventRow[] = [];
    if (request) {
      const { data: evData, error: evErr } = await supabase.rpc("bloodhero_tracker_events", {
        p_request_ids: [request.id],
      });

      if (evErr) {
        if (isMissingTrackerRpcError(evErr)) {
          return {
            error:
              process.env.NODE_ENV === "development"
                ? "Tracker events RPC missing — apply supabase/migrations/007_bloodhero_tracker.sql."
                : "The tracker is temporarily unavailable. Please try again later.",
          };
        }
        return {
          error:
            evErr.message ||
            "We could not load timeline details. Please try again in a moment.",
        };
      }
      events = (evData ?? []) as BloodHeroTrackerEventRow[];
    }

    return {
      data: {
        trackingNumberUsed: trackingNorm,
        request,
        events,
      },
    };
  } catch {
    return {
      error: "Something went wrong. Please try again in a moment.",
    };
  }
}
