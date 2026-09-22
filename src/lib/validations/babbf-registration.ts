import { z } from "zod";
import { BLOOD_HERO_BLOOD_GROUPS } from "@/lib/validations/bloodhero-shared";

export const BABBF_GENDERS = ["male", "female", "other"] as const;
export type BabbfGender = (typeof BABBF_GENDERS)[number];
export const BABBF_GENDER_LABEL: Record<BabbfGender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export const BABBF_EVENT_TYPES = ["armwrestling", "bodybuilding"] as const;
export type BabbfEventType = (typeof BABBF_EVENT_TYPES)[number];
export const BABBF_EVENT_TYPE_LABEL: Record<BabbfEventType, string> = {
  armwrestling: "Armwrestling",
  bodybuilding: "Bodybuilding",
};

export const BABBF_STUDENT_CATEGORIES = ["university", "school_college"] as const;
export type BabbfStudentCategory = (typeof BABBF_STUDENT_CATEGORIES)[number];
export const BABBF_STUDENT_CATEGORY_LABEL: Record<BabbfStudentCategory, string> = {
  university: "University Students",
  school_college: "School & College Students",
};

export const BABBF_UNIVERSITY_WEIGHT_CATEGORIES = [
  "1–60 kg",
  "61–65 kg",
  "66–70 kg",
  "71–80 kg",
  "80+ kg",
] as const;
export const BABBF_SCHOOL_COLLEGE_WEIGHT_CATEGORIES = ["1–80 kg", "80+ kg Open"] as const;

export function babbfWeightCategoriesFor(studentCategory: string): readonly string[] {
  return studentCategory === "school_college" ? BABBF_SCHOOL_COLLEGE_WEIGHT_CATEGORIES : BABBF_UNIVERSITY_WEIGHT_CATEGORIES;
}

export const BABBF_BODYBUILDING_WEIGHT_CLASSES = ["60kg", "65kg", "70kg", "70kg+"] as const;
export const BABBF_MENS_PHYSIQUE_HEIGHT_CLASSES = ["166cm", "166cm+"] as const;

export const BABBF_STATUSES = [
  "New",
  "Payment Pending",
  "Confirmed",
  "Payment Failed",
  "Rejected",
  "Duplicate",
] as const;
export type BabbfStatus = (typeof BABBF_STATUSES)[number];

export const BABBF_REGISTRATION_FEE_BDT = 1000;

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
  universityName: req("Institution name is required"),
  department: optionalTrimmed,
  gender: z.enum(BABBF_GENDERS, { error: () => ({ message: "Select a gender." }) }),
  eventType: z.enum(BABBF_EVENT_TYPES, { error: () => ({ message: "Select an event." }) }),
  studentCategory: optionalTrimmed,
  studentIdOrNid: optionalTrimmed,
  category: optionalTrimmed,
  bodybuildingClass: optionalTrimmed,
  physiqueClass: optionalTrimmed,
  denimJeansOptIn: z.enum(["true", "false"]).default("false"),
  rightHandConfirmed: z.enum(["true", "false"]).default("false"),
  declarationAccepted: z.enum(["true", "false"]).default("false"),
  // Optional per mirrored bloodhero-donor pattern — not everyone knows/wants to share their blood group.
  bloodGroup: optionalTrimmed.pipe(
    z.string().refine((v) => v === "" || (BLOOD_HERO_BLOOD_GROUPS as readonly string[]).includes(v), {
      message: "Choose a valid blood group",
    })
  ),

  paymentMethod: z.enum(BABBF_PAYMENT_METHODS, { error: () => ({ message: "Select a payment method." }) }),
  paymentSenderNumber: z
    .string()
    .trim()
    .min(1, "Sender's bKash/Nagad number is required")
    .refine((v) => /^[\d+\-\s()]{8,22}$/.test(v) && v.replace(/\D/g, "").length >= 7, "Enter a valid number"),
  transactionId: req("Transaction ID is required"),
}).superRefine((d, ctx) => {
  if (d.eventType === "armwrestling") {
    if (!BABBF_STUDENT_CATEGORIES.includes(d.studentCategory as BabbfStudentCategory)) {
      ctx.addIssue({ code: "custom", path: ["studentCategory"], message: "Select a student category." });
    }
    const valid = babbfWeightCategoriesFor(d.studentCategory);
    if (!d.category || !valid.includes(d.category)) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "Select a weight category." });
    }
    if (!d.studentIdOrNid) {
      ctx.addIssue({ code: "custom", path: ["studentIdOrNid"], message: "Student ID / status / NID is required." });
    }
    if (d.rightHandConfirmed !== "true") {
      ctx.addIssue({ code: "custom", path: ["rightHandConfirmed"], message: "Confirm you compete with your right hand." });
    }
    if (d.declarationAccepted !== "true") {
      ctx.addIssue({ code: "custom", path: ["declarationAccepted"], message: "You must accept the declaration." });
    }
  } else {
    if (!d.bodybuildingClass && !d.physiqueClass && d.denimJeansOptIn !== "true") {
      ctx.addIssue({ code: "custom", path: ["bodybuildingClass"], message: "Select at least one category to enter." });
    }
    if (d.bodybuildingClass && !(BABBF_BODYBUILDING_WEIGHT_CLASSES as readonly string[]).includes(d.bodybuildingClass)) {
      ctx.addIssue({ code: "custom", path: ["bodybuildingClass"], message: "Select a valid weight class." });
    }
    if (d.physiqueClass && !(BABBF_MENS_PHYSIQUE_HEIGHT_CLASSES as readonly string[]).includes(d.physiqueClass)) {
      ctx.addIssue({ code: "custom", path: ["physiqueClass"], message: "Select a valid height class." });
    }
    if (!d.department) {
      ctx.addIssue({ code: "custom", path: ["department"], message: "Department is required." });
    }
  }
});

export type BabbfRegistrationParsed = z.infer<typeof babbfRegistrationSchema>;
