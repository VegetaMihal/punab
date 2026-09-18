import { z } from "zod";
import { BLOOD_HERO_BLOOD_GROUPS } from "@/lib/validations/bloodhero-shared";

export const BABBF_GENDERS = ["male", "female", "other"] as const;
export type BabbfGender = (typeof BABBF_GENDERS)[number];
export const BABBF_GENDER_LABEL: Record<BabbfGender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

// assumed: weight classes are a reasonable armwrestling set — confirm with user before publishing
export const BABBF_WEIGHT_CATEGORIES = [
  "Under 60kg",
  "60-70kg",
  "70-80kg",
  "80-90kg",
  "90kg+",
] as const;
export type BabbfWeightCategory = (typeof BABBF_WEIGHT_CATEGORIES)[number];

export const BABBF_STATUSES = [
  "New",
  "Payment Pending",
  "Confirmed",
  "Payment Failed",
  "Rejected",
  "Duplicate",
] as const;
export type BabbfStatus = (typeof BABBF_STATUSES)[number];

// assumed: registration fee 500 BDT, confirm with user
export const BABBF_REGISTRATION_FEE_BDT = 500;

export const BABBF_PAYMENT_METHODS = ["bkash", "nagad"] as const;
export type BabbfPaymentMethod = (typeof BABBF_PAYMENT_METHODS)[number];
export const BABBF_PAYMENT_METHOD_LABEL: Record<BabbfPaymentMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
};

const req = (msg: string) => z.string().trim().min(1, msg);
const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s === undefined || s === "" ? "" : s));

export const babbfRegistrationSchema = z.object({
  fullName: req("Full name is required"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine((v) => /^[\d+\-\s()]{8,22}$/.test(v) && v.replace(/\D/g, "").length >= 7, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
  universityName: req("University name is required"),
  department: req("Department is required"),
  gender: z.enum(BABBF_GENDERS, { error: () => ({ message: "Select a gender." }) }),
  weightCategory: z.enum(BABBF_WEIGHT_CATEGORIES, { error: () => ({ message: "Select a weight category." }) }),
  // Optional per mirrored bloodhero-donor pattern — not everyone knows/wants to share their blood group.
  bloodGroup: optionalTrimmed.pipe(
    z.string().refine((v) => v === "" || (BLOOD_HERO_BLOOD_GROUPS as readonly string[]).includes(v), {
      message: "Choose a valid blood group",
    })
  ),

  paymentMethod: z.enum(BABBF_PAYMENT_METHODS, { error: () => ({ message: "Select a payment method." }) }),
  transactionId: req("Transaction ID is required"),
});

export type BabbfRegistrationParsed = z.infer<typeof babbfRegistrationSchema>;
