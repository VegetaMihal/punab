"use server";

/**
 * BloodHero blood requests — `bloodhero_insert_request_public` RPC (returns tracking_number; anon RLS blocks post-insert SELECT).
 *
 * After successful insert we trigger matching + donor notifications in `after(...)`.
 * Matching/email failures are logged and never roll back the request itself.
 */
import { createClient } from "@/lib/supabase/server";
import {
  bloodHeroRequestFieldErrors,
  bloodHeroRequestFormSchema,
  parseBloodHeroRequestFormData,
} from "@/lib/validations/bloodhero-request";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { sendBloodHeroDonorNotificationsForRequest } from "@/lib/bloodhero/send-donor-notifications";
import { runBloodHeroMatchingForRequest } from "@/lib/bloodhero/matching";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { geocodeBloodHeroAddress } from "@/lib/bloodhero/geocode";

export type BloodHeroRequestActionState = {
  success?: boolean;
  /** Public code (BH-YYYY-NNNNNN) returned after insert; save for /bloodhero/track. */
  trackingNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function isMissingBloodheroSubmitRpcError(err: { message?: string } | null): boolean {
  const m = (err?.message ?? "").toLowerCase();
  return (
    m.includes("bloodhero_insert_request_public") &&
    (m.includes("does not exist") || m.includes("not found") || m.includes("schema cache"))
  );
}

export async function submitBloodHeroRequest(
  _prev: BloodHeroRequestActionState,
  formData: FormData
): Promise<BloodHeroRequestActionState> {
  const raw = parseBloodHeroRequestFormData(formData);
  const parsed = bloodHeroRequestFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: bloodHeroRequestFieldErrors(parsed.error),
    };
  }

  const d = parsed.data;

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const missingEnv =
      msg.includes("NEXT_PUBLIC_SUPABASE_URL") ||
      msg.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
    return {
      error: missingEnv
        ? "BloodHero is not available right now (server configuration). Please try again later."
        : "We could not connect to our services. Please try again in a moment.",
    };
  }

  const when = new Date(d.planned_donation_at);
  if (Number.isNaN(when.getTime())) {
    return {
      fieldErrors: {
        planned_donation_at: "Invalid date and time — please choose again.",
      },
    };
  }

  let plannedIso: string;
  try {
    plannedIso = when.toISOString();
  } catch {
    return {
      fieldErrors: {
        planned_donation_at: "Invalid date and time — please choose again.",
      },
    };
  }

  try {
    const { data: inserted, error } = await supabase.rpc("bloodhero_insert_request_public", {
      p_requester_name: d.requester_name.trim(),
      p_requester_email: d.requester_email.trim().toLowerCase(),
      p_requester_phone: d.requester_phone.trim(),
      p_patient_name: d.patient_name.trim(),
      p_patient_condition: d.patient_condition?.trim() ?? "",
      p_donation_location: d.donation_location.trim(),
      p_district: d.district.trim(),
      p_blood_group: d.blood_group,
      p_planned_donation_at: plannedIso,
      p_request_quantity: d.request_quantity,
      p_status: "open",
    });

    if (error) {
      if (isMissingBloodheroSubmitRpcError(error)) {
        return {
          error:
            process.env.NODE_ENV === "development"
              ? "Submit RPC missing — apply supabase/migrations/009_bloodhero_tracking_number.sql (and prior BloodHero migrations) in Supabase."
              : "This service is temporarily unavailable. Please try again later.",
        };
      }
      const em = (error.message ?? "").toLowerCase();
      if (em.includes("invalid bloodhero request")) {
        return {
          error:
            "We could not save your request. Please check the form and try again.",
        };
      }
      return {
        error:
          error.message ||
          "We could not save your request. Please try again in a moment.",
      };
    }

    const insertedRow = Array.isArray(inserted) ? inserted[0] : inserted;
    const tn =
      insertedRow &&
      typeof insertedRow === "object" &&
      "tracking_number" in insertedRow &&
      typeof (insertedRow as { tracking_number: unknown }).tracking_number === "string"
        ? (insertedRow as { tracking_number: string }).tracking_number
        : "";

    if (!tn) {
      return {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? "Submit RPC returned no tracking_number — check migration 009 and RPC definition."
            : "We could not confirm your request. Please try again or contact support.",
      };
    }

    const requestId =
      insertedRow && typeof insertedRow === "object" && "id" in insertedRow
        ? String((insertedRow as { id: unknown }).id)
        : "";
    if (requestId) {
      after(async () => {
        try {
          const normalizedAddress = d.donation_location.trim();
          const loc = await geocodeBloodHeroAddress(normalizedAddress);
          try {
            const service = createServiceRoleSupabase();
            await service
              .from("bloodhero_requests")
              .update({
                donation_location_address: normalizedAddress,
                donation_location_lat: loc?.lat ?? null,
                donation_location_lng: loc?.lng ?? null,
              })
              .eq("id", requestId);
          } catch (e) {
            console.warn("[BloodHero] request location enrichment failed", {
              requestId,
              message: e instanceof Error ? e.message : String(e),
            });
          }

          const match = await runBloodHeroMatchingForRequest(requestId);
          if (!match.ok) {
            console.warn("[BloodHero] matching run failed after request insert", {
              requestId,
              error: match.error,
              detail: match.detail,
            });
            return;
          }
          if (process.env.NODE_ENV === "development") {
            console.info("[BloodHero] matching run result", {
              requestId,
              inserted: match.inserted,
            });
          }
          if (match.inserted > 0) {
            const r = await sendBloodHeroDonorNotificationsForRequest(requestId);
            if (r.errors.length > 0 && process.env.NODE_ENV === "development") {
              console.warn("[BloodHero] donor notification send:", r.errors);
            }
          }
        } catch (e) {
          console.error("[BloodHero] matching/notification after request insert failed", e);
        }
      });
    }

    revalidatePath("/bloodhero/request");
    return { success: true, trackingNumber: tn };
  } catch {
    return {
      error:
        "We could not save your request. Please check your connection and try again.",
    };
  }
}
