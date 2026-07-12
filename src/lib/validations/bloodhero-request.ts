import { z } from "zod";
import {
  zodBloodHeroBloodGroup,
  zodErrorsToFieldMap,
} from "@/lib/validations/bloodhero-shared";

const GRACE_MS = 60_000;

export const bloodHeroRequestFormSchema = z.object({
  requester_name: z.string().trim().min(2, "Enter your name"),
  requester_email: z.string().trim().email("Enter a valid email address"),
  requester_phone: z
    .string()
    .trim()
    .min(6, "Enter a phone number we can reach you on")
    .max(40, "Phone number is too long"),
  patient_name: z.string().trim().min(2, "Enter the patient name or identifier you use"),
  patient_condition: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(800, "Keep the condition note shorter").optional()
  ),
  donation_location: z.string().trim().min(2, "Enter hospital or donation venue"),
  district: z.string().trim().min(2, "Enter district or area"),
  blood_group: zodBloodHeroBloodGroup(),
  planned_donation_at: z
    .string()
    .trim()
    .min(1, "Choose date and time for the need")
    .superRefine((val, ctx) => {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date and time",
        });
        return;
      }
      if (d.getTime() < Date.now() - GRACE_MS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choose a time from now onward (small clock differences are OK)",
        });
      }
    }),
  request_quantity: z
    .string()
    .trim()
    .min(1, "Enter quantity")
    .refine((s) => /^\d+$/.test(s), { message: "Use a whole number (no decimals)" })
    .transform((s) => Number.parseInt(s, 10))
    .refine((n) => !Number.isNaN(n), { message: "Enter a valid number" })
    .refine((n) => n >= 1, { message: "At least one unit" })
    .refine((n) => n <= 50, {
      message: "For larger needs, add a note above and contact coordinators directly",
    }),
});

export type BloodHeroRequestFormInput = z.output<typeof bloodHeroRequestFormSchema>;

export function parseBloodHeroRequestFormData(fd: FormData) {
  return {
    requester_name: fd.get("requester_name")?.toString() ?? "",
    requester_email: fd.get("requester_email")?.toString() ?? "",
    requester_phone: fd.get("requester_phone")?.toString() ?? "",
    patient_name: fd.get("patient_name")?.toString() ?? "",
    patient_condition: fd.get("patient_condition")?.toString() ?? "",
    donation_location: fd.get("donation_location")?.toString() ?? "",
    district: fd.get("district")?.toString() ?? "",
    blood_group: fd.get("blood_group")?.toString() ?? "",
    planned_donation_at: fd.get("planned_donation_at")?.toString() ?? "",
    request_quantity: fd.get("request_quantity")?.toString() ?? "1",
  };
}

export function bloodHeroRequestFieldErrors(err: z.ZodError): Record<string, string> {
  return zodErrorsToFieldMap(err);
}
