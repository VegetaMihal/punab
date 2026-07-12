import { z } from "zod";

export const BLOOD_HERO_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodHeroBloodGroup = (typeof BLOOD_HERO_BLOOD_GROUPS)[number];

/** Shared Zod field for HTML select / text blood group values. */
export function zodBloodHeroBloodGroup() {
  return z
    .string()
    .trim()
    .min(1, "Choose your blood group")
    .refine(
      (v): v is BloodHeroBloodGroup =>
        (BLOOD_HERO_BLOOD_GROUPS as readonly string[]).includes(v),
      "Choose your blood group"
    );
}

export function zodErrorsToFieldMap(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
