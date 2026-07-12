import { z } from "zod";

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s === undefined || s === "" ? undefined : s));

const DRIVE_HOSTS = new Set([
  "drive.google.com",
  "docs.google.com",
  "drive.usercontent.google.com",
]);

export function segmentsFromDriveLinksField(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const JULY_AWARD_FACULTY_ROLES = ["teacher", "convener", "advisor"] as const;
export type JulyAwardFacultyRole = (typeof JULY_AWARD_FACULTY_ROLES)[number];

export const JULY_AWARD_FACULTY_ROLE_LABEL: Record<JulyAwardFacultyRole, string> = {
  teacher: "Teacher",
  convener: "Convener",
  advisor: "Advisor",
};

function isAllowedDriveOrDocsUrl(href: string): boolean {
  try {
    const u = new URL(href);
    const h = u.hostname.replace(/^www\./, "");
    return DRIVE_HOSTS.has(h);
  } catch {
    return false;
  }
}

export const julyAwardNominationFormSchema = z
  .object({
    clubName: z.string().trim().min(1, "Club name is required"),
    universityName: z.string().trim().min(1, "University name is required"),
    clubSocialLink: z.string().trim().url("Enter a valid URL"),
    yearEstablished: optionalTrimmed,
    communicationEmail: z.string().trim().email("Enter a valid email"),
    mobileNumber: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid mobile number"),
    activeMembersApprox: optionalTrimmed,
    eventsLast12Months: z
      .string()
      .trim()
      .min(1, "Number of events is required")
      .regex(/^\d+$/, "Enter a whole number"),
    presidentName: optionalTrimmed,
    facultyRole: z.enum(JULY_AWARD_FACULTY_ROLES, {
      error: () => ({ message: "Choose teacher, convener, or advisor." }),
    }),
    facultyContactName: z.string().trim().min(1, "Full name is required"),
    facultyContactMobile: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid mobile number"),
    supportingDriveLinks: z
      .string()
      .trim()
      .optional()
      .transform((s) => (s === undefined || s === "" ? "" : s)),
  })
  .superRefine((data, ctx) => {
    const parts = segmentsFromDriveLinksField(data.supportingDriveLinks);
    for (const p of parts) {
      if (!isAllowedDriveOrDocsUrl(p)) {
        ctx.addIssue({
          code: "custom",
          message:
            "Use Google Drive or Google Docs sharing links only (one per line or separated by commas).",
          path: ["supportingDriveLinks"],
        });
        return;
      }
    }
  });

export type JulyAwardNominationParsed = z.infer<typeof julyAwardNominationFormSchema>;

/** Single cell value for the sheet (validated segments joined). */
export function joinDriveLinksForSheet(raw: string): string {
  return segmentsFromDriveLinksField(raw).join(" | ");
}

export const JULY_AWARD_SUPPORTING_DOCUMENTS_REQUIRED_MSG =
  "Provide at least one: Google Drive / Docs link(s), or upload a PDF below (max 5 MB). You may provide both.";

export function hasJulyAwardSupportingDocument(
  driveLinksRaw: string,
  hasPdf: boolean
): boolean {
  if (hasPdf) return true;
  return segmentsFromDriveLinksField(driveLinksRaw).length > 0;
}
