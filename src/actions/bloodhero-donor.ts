"use server";

/**
 * BloodHero donor signup — uses `bloodhero_donors` only (no PUNAB Prisma / member tables).
 * Public anon Supabase client + RLS insert policy.
 */
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { getBloodHeroDonorAutoApprovalSetting } from "@/lib/bloodhero/settings";
import { sendDonorApprovalWelcomeEmail } from "@/lib/bloodhero/donor-approval-welcome-email";
import {
  BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
  logBloodHeroEmailAttempt,
  logBloodHeroEmailResult,
  persistBloodHeroEmailEvent,
} from "@/lib/bloodhero/email-event-log";
import {
  bloodHeroDonorFieldErrors,
  bloodHeroDonorFormSchema,
  parseBloodHeroDonorFormData,
} from "@/lib/validations/bloodhero-donor";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { geocodeBloodHeroAddress } from "@/lib/bloodhero/geocode";

export type BloodHeroDonorActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const DUPLICATE_EMAIL_MESSAGE =
  "This email is already registered as a BloodHero donor. If that was you, our team will follow up—no need to sign up again.";

type SupabaseOpError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

type RegisterDonorRpcRow = {
  donor_id: string;
  donor_status: string;
  donor_email: string;
  donor_name: string;
};

type DonorInsertRow = {
  full_name: string;
  email: string;
  phone: string;
  blood_group: string;
  district: string;
  last_donated_date: string | null;
  available_now: boolean;
  status: "pending" | "active";
  block_until: null;
  total_successful_donations: number;
};

function isApprovedLikeStatus(status: string | null | undefined): boolean {
  const s = (status ?? "").trim().toLowerCase();
  return s === "active" || s === "approved";
}

async function sendAndLogRegistrationWelcomeEmail(
  inserted: RegisterDonorRpcRow,
  eventWriter?: SupabaseClient
): Promise<void> {
  if (!isApprovedLikeStatus(inserted.donor_status)) return;

  const donorId = inserted.donor_id;
  const recipient = inserted.donor_email;
  logBloodHeroEmailAttempt({
    donorId,
    emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
    recipient,
  });

  const sent = await sendDonorApprovalWelcomeEmail(recipient, {
    donorName: inserted.donor_name || "there",
  });

  if (sent.ok) {
    logBloodHeroEmailResult({
      donorId,
      emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
      recipient,
      status: "success",
    });
    if (eventWriter) {
      await persistBloodHeroEmailEvent(eventWriter, {
        donorId,
        emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
        recipient,
        status: "success",
      });
    }
  } else {
    logBloodHeroEmailResult({
      donorId,
      emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
      recipient,
      status: "failed",
      errorMessage: sent.reason,
    });
    if (eventWriter) {
      await persistBloodHeroEmailEvent(eventWriter, {
        donorId,
        emailType: BLOODHERO_EMAIL_TYPE_DONOR_APPROVAL_WELCOME,
        recipient,
        status: "failed",
        errorMessage: sent.reason,
      });
    }
  }
}

function isUniqueViolation(err: SupabaseOpError | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "");
  const msg = (err.message ?? "").toLowerCase();
  return (
    code === "23505" ||
    msg.includes("duplicate key") ||
    msg.includes("unique constraint") ||
    msg.includes("already exists")
  );
}

/** PostgREST: table not in API schema cache. Postgres: undefined_table. */
function isMissingBloodheroTableError(err: SupabaseOpError | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "");
  if (code === "PGRST205" || code === "42P01") return true;
  const m = (err.message ?? "").toLowerCase();
  if (!m.includes("bloodhero_donors")) return false;
  return (
    m.includes("does not exist") ||
    m.includes("could not find") ||
    m.includes("schema cache") ||
    m.includes("not found")
  );
}

function isRlsInsertDenied(err: SupabaseOpError | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "");
  const msg = (err.message ?? "").toLowerCase();
  return (
    code === "42501" ||
    msg.includes("row-level security") ||
    msg.includes("violates row-level security")
  );
}

/** PostgREST missing-function / Postgres undefined function (migration 018 not applied). */
function isMissingRegisterDonorRpcError(err: SupabaseOpError | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "");
  if (code === "PGRST202" || code === "42883") return true;
  const m = (err.message ?? "").toLowerCase();
  return m.includes("bloodhero_register_donor") && (m.includes("not found") || m.includes("does not exist"));
}

async function readAutoApprovalViaPublicRpc(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<boolean | null> {
  try {
    const { data, error } = await supabase.rpc("bloodhero_donor_auto_approval_enabled");
    if (error) return null;
    return typeof data === "boolean" ? data : null;
  } catch {
    return null;
  }
}

function asInsertResultRow(data: unknown): RegisterDonorRpcRow | null {
  const first = Array.isArray(data) ? data[0] : null;
  if (!first || typeof first !== "object") return null;
  const maybe = first as Partial<RegisterDonorRpcRow>;
  if (
    typeof maybe.donor_id !== "string" ||
    typeof maybe.donor_status !== "string" ||
    typeof maybe.donor_email !== "string" ||
    typeof maybe.donor_name !== "string"
  ) {
    return null;
  }
  return {
    donor_id: maybe.donor_id,
    donor_status: maybe.donor_status,
    donor_email: maybe.donor_email,
    donor_name: maybe.donor_name,
  };
}

async function fallbackRegisterDonorWithoutRpc(row: DonorInsertRow): Promise<{
  inserted?: RegisterDonorRpcRow;
  error?: string;
}> {
  try {
    const service = createServiceRoleSupabase();
    let enabled = false;
    try {
      enabled = await getBloodHeroDonorAutoApprovalSetting(service);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("[BloodHero] auto-approval setting read failed in RPC fallback; defaulting OFF", {
        message: msg,
      });
      enabled = false;
    }

    const status: "pending" | "active" = enabled ? "active" : "pending";
    const { data, error } = await service
      .from("bloodhero_donors")
      .insert({ ...row, status })
      .select("id, status, email, full_name")
      .single();

    if (error) {
      if (isUniqueViolation(error)) {
        return { error: DUPLICATE_EMAIL_MESSAGE };
      }
      if (isRlsInsertDenied(error)) {
        return {
          error:
            process.env.NODE_ENV === "development"
              ? "Insert was blocked by RLS in RPC fallback (42501). Ensure SUPABASE_SERVICE_ROLE_KEY is set for server-side fallback, or re-apply 005_bloodhero_donors.sql so anon/authenticated pending inserts are allowed."
              : "Registration is temporarily unavailable. Please try again later.",
        };
      }
      return {
        error:
          process.env.NODE_ENV === "development" && error.code
            ? `${error.message || "Database error"} (code ${error.code})`
            : error.message || "We could not save your registration. Please try again in a moment.",
      };
    }

    return {
      inserted: {
        donor_id: data.id,
        donor_status: data.status,
        donor_email: data.email,
        donor_name: data.full_name,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[BloodHero] RPC missing fallback failed", { message: msg });

    // Last-resort restore path: try to honor current auto-approval setting without service role.
    try {
      const supabase = await createClient();
      const autoApproval = await readAutoApprovalViaPublicRpc(supabase);
      const status: "pending" | "active" = autoApproval === true ? "active" : "pending";
      if (process.env.NODE_ENV === "development") {
        console.info("[BloodHero] registration fallback status decision", {
          autoApprovalEnabled: autoApproval,
          finalStatus: status,
          decisionSource: autoApproval === null ? "default_pending" : "bloodhero_donor_auto_approval_enabled()",
        });
      }
      const { data, error } = await supabase
        .from("bloodhero_donors")
        .insert({ ...row, status })
        .select("id, status, email, full_name")
        .single();
      if (error) {
        if (isUniqueViolation(error)) {
          return { error: DUPLICATE_EMAIL_MESSAGE };
        }
        if (isRlsInsertDenied(error)) {
          return {
            error:
              process.env.NODE_ENV === "development"
                ? "Insert was blocked (RLS / 42501). If auto approval is ON, ensure either SUPABASE_SERVICE_ROLE_KEY is set or DB policies/functions from migration 018 are applied."
                : "Registration is temporarily unavailable. Please try again later.",
          };
        }
        return {
          error:
            process.env.NODE_ENV === "development" && error.code
              ? `${error.message || "Database error"} (code ${error.code})`
              : error.message || "We could not save your registration. Please try again in a moment.",
        };
      }
      return {
        inserted: {
          donor_id: data.id,
          donor_status: data.status,
          donor_email: data.email,
          donor_name: data.full_name,
        },
      };
    } catch {
      return {
        error: "We could not save your registration. Please check your connection and try again.",
      };
    }
  }
}

export async function registerBloodHeroDonor(
  _prev: BloodHeroDonorActionState,
  formData: FormData
): Promise<BloodHeroDonorActionState> {
  const raw = parseBloodHeroDonorFormData(formData);
  const parsed = bloodHeroDonorFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: bloodHeroDonorFieldErrors(parsed.error),
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
        ? "BloodHero registration is not available right now (server configuration). Please try again later."
        : "We could not connect to our services. Please try again in a moment.",
    };
  }

  const row: DonorInsertRow = {
    full_name: d.full_name.trim(),
    email: d.email.trim().toLowerCase(),
    phone: d.phone.trim(),
    blood_group: d.blood_group,
    district: (d.district_or_area ?? d.center_point_address).trim(),
    last_donated_date: d.last_donated_date ?? null,
    available_now: d.available_now,
    status: "pending",
    block_until: null as null,
    total_successful_donations: 0,
  };

  let inserted: RegisterDonorRpcRow | null = null;
  try {
    const { data, error } = await supabase.rpc("bloodhero_register_donor", {
      p_full_name: row.full_name,
      p_email: row.email,
      p_phone: row.phone,
      p_blood_group: row.blood_group,
      p_district: row.district,
      p_last_donated_date: row.last_donated_date,
      p_available_now: row.available_now,
    });

    if (error) {
      if (isUniqueViolation(error)) {
        return { error: DUPLICATE_EMAIL_MESSAGE };
      }
      if (isMissingBloodheroTableError(error)) {
        return {
          error:
            process.env.NODE_ENV === "development"
              ? "Table public.bloodhero_donors is not in this Supabase project (PostgREST PGRST205 or undefined table). In Supabase → SQL Editor, run punab-web/supabase/migrations/005_bloodhero_donors.sql. For requests, matching, and donor-response flows, apply 006 through 013 in numeric order afterward. See SETUP.md (BloodHero)."
              : "Registration is temporarily unavailable. Please try again later.",
        };
      }
      if (isRlsInsertDenied(error)) {
        return {
          error:
            process.env.NODE_ENV === "development"
              ? "Insert was blocked (RLS / 42501). Check policies on public.bloodhero_donors and that the anon key is allowed to INSERT per 005_bloodhero_donors.sql."
              : "We could not save your registration. Please try again in a moment.",
        };
      }
      if (isMissingRegisterDonorRpcError(error)) {
        console.warn("[BloodHero] RPC public.bloodhero_register_donor missing; using fallback registration path");
        const fallback = await fallbackRegisterDonorWithoutRpc(row);
        if (fallback.error) return { error: fallback.error };
        inserted = fallback.inserted ?? null;
        // Fallback succeeded; keep registration flow non-blocking for email outcome.
        revalidatePath("/bloodhero/donor");
        if (inserted) {
          let eventWriter: SupabaseClient | undefined;
          try {
            eventWriter = createServiceRoleSupabase();
          } catch {
            eventWriter = undefined;
          }
          await sendAndLogRegistrationWelcomeEmail(inserted, eventWriter);
        }
        return { success: true };
      }
      return {
        error:
          process.env.NODE_ENV === "development" && error.code
            ? `${error.message || "Database error"} (code ${error.code})`
            : error.message || "We could not save your registration. Please try again in a moment.",
      };
    }
    inserted = asInsertResultRow(data);
  } catch {
    return {
      error:
        "We could not save your registration. Please check your connection and try again.",
    };
  }

  if (inserted) {
    const centerPointAddress = d.center_point_address.trim();
    const centerPoint = await geocodeBloodHeroAddress(centerPointAddress);
    try {
      const service = createServiceRoleSupabase();
      await service
        .from("bloodhero_donors")
        .update({
          center_point_address: centerPointAddress,
          center_point_lat: centerPoint?.lat ?? null,
          center_point_lng: centerPoint?.lng ?? null,
          district_or_area: d.district_or_area?.trim() || null,
        })
        .eq("id", inserted.donor_id);
    } catch (e) {
      console.warn("[BloodHero] donor location enrichment failed", {
        donorId: inserted.donor_id,
        message: e instanceof Error ? e.message : String(e),
      });
    }

    let eventWriter: SupabaseClient | undefined;
    try {
      eventWriter = createServiceRoleSupabase();
    } catch {
      eventWriter = undefined;
    }
    await sendAndLogRegistrationWelcomeEmail(inserted, eventWriter);
  }

  revalidatePath("/bloodhero/donor");
  return { success: true };
}
