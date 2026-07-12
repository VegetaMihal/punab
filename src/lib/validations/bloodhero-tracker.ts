import { z } from "zod";
import { zodErrorsToFieldMap } from "@/lib/validations/bloodhero-shared";

/** Normalize user input: trim, remove inner spaces, uppercase (matches DB lookup). */
export function normalizeBloodHeroTrackingNumber(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

/**
 * Canonical stored format from DB: BH-YYYY-NNNNNN (e.g. BH-2026-000001).
 * Year is UTC calendar year at insert; suffix is a global sequence (see migration 009).
 */
const TRACKING_NUMBER_RE = /^BH-\d{4}-\d{6}$/;

export const bloodHeroTrackerLookupSchema = z.object({
  tracking_number: z
    .string()
    .min(1, "Enter your tracking number")
    .transform((s) => normalizeBloodHeroTrackingNumber(s))
    .refine((v) => TRACKING_NUMBER_RE.test(v), {
      message:
        "Use the format BH-2026-000123 (check the confirmation we showed after you submitted).",
    }),
});

export type BloodHeroTrackerLookupInput = z.infer<typeof bloodHeroTrackerLookupSchema>;

export function parseBloodHeroTrackerFormData(fd: FormData) {
  return {
    tracking_number: fd.get("tracking_number")?.toString() ?? "",
  };
}

export function bloodHeroTrackerFieldErrors(err: z.ZodError): Record<string, string> {
  return zodErrorsToFieldMap(err);
}
