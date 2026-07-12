import { z } from "zod";
import {
  zodBloodHeroBloodGroup,
  zodErrorsToFieldMap,
} from "@/lib/validations/bloodhero-shared";

export { BLOOD_HERO_BLOOD_GROUPS, type BloodHeroBloodGroup } from "@/lib/validations/bloodhero-shared";

export const bloodHeroDonorFormSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(6, "Enter a phone number we can reach you on")
      .max(40, "Phone number is too long"),
    blood_group: zodBloodHeroBloodGroup(),
    center_point_address: z.string().trim().min(5, "Enter your center donation point address"),
    district_or_area: z
      .union([z.string(), z.undefined()])
      .transform((s) => {
        if (s === undefined || s === null) return undefined;
        const t = String(s).trim();
        return t === "" ? undefined : t;
      }),
    last_donated_date: z
      .union([z.string(), z.undefined()])
      .transform((s) => {
        if (s === undefined || s === null) return undefined;
        const t = String(s).trim();
        return t === "" ? undefined : t;
      })
      .refine((s) => s === undefined || /^\d{4}-\d{2}-\d{2}$/.test(s), {
        message: "Use a valid last donation date",
      }),
    available_now: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.available_now && !data.last_donated_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either check “I’m available now” or enter your last donation date",
        path: ["availability"],
      });
    }
    if (data.last_donated_date) {
      const todayUtc = new Date().toISOString().slice(0, 10);
      if (data.last_donated_date > todayUtc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last donation date cannot be in the future",
          path: ["last_donated_date"],
        });
      }
    }
  });

export type BloodHeroDonorFormInput = z.output<typeof bloodHeroDonorFormSchema>;

/** Build object from browser FormData (snake_case field names). */
export function parseBloodHeroDonorFormData(fd: FormData) {
  const lastRaw = fd.get("last_donated_date")?.toString() ?? "";
  return {
    full_name: fd.get("full_name")?.toString() ?? "",
    email: fd.get("email")?.toString() ?? "",
    phone: fd.get("phone")?.toString() ?? "",
    blood_group: fd.get("blood_group")?.toString() ?? "",
    center_point_address: fd.get("center_point_address")?.toString() ?? "",
    district_or_area: fd.get("district_or_area")?.toString() ?? "",
    last_donated_date: lastRaw.trim() === "" ? undefined : lastRaw.trim(),
    available_now: fd.get("available_now") === "on" || fd.get("available_now") === "true",
  };
}

export function bloodHeroDonorFieldErrors(err: z.ZodError): Record<string, string> {
  return zodErrorsToFieldMap(err);
}
