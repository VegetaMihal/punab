import { z } from "zod";

function linesFromField(raw: string): string[] {
  return raw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const julyTeacherHonorNominationFormSchema = z
  .object({
    nominatorFullName: z.string().trim().min(1, "Your full name is required"),
    nominatorEmail: z.string().trim().email("Enter a valid email"),
    nominatorPhone: z
      .string()
      .trim()
      .min(1, "Your phone number is required")
      .regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid phone number"),
    nominatorUniversity: z.string().trim().min(1, "Your university is required"),
    teacherFullName: z.string().trim().min(1, "Teacher’s full name is required"),
    teacherDesignation: z.string().trim().min(1, "Teacher’s designation is required"),
    teacherUniversityName: z.string().trim().min(1, "Teacher’s university is required"),
    departmentSubject: z.string().trim().min(1, "Department or subject is required"),
    teacherPhone: z
      .string()
      .trim()
      .min(1, "Teacher’s phone number is required")
      .regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid phone number"),
    teacherEmail: z.string().trim().email("Enter a valid teacher email"),
    teacherSocialLink: z.string().trim().url("Enter a valid URL"),
    nominationNarrative: z.string().trim().min(1, "Required"),
    referenceLinks: z
      .string()
      .trim()
      .optional()
      .transform((s) => (s === undefined || s === "" ? "" : s)),
  })
  .superRefine((data, ctx) => {
    const lines = linesFromField(data.referenceLinks);
    for (const line of lines) {
      if (!z.string().url().safeParse(line).success) {
        ctx.addIssue({
          code: "custom",
          message: "Each reference line must be a full URL (https://…). Leave blank if none.",
          path: ["referenceLinks"],
        });
        return;
      }
    }
  });

export type JulyTeacherHonorNominationParsed = z.infer<typeof julyTeacherHonorNominationFormSchema>;

export function joinReferenceLinksForSheet(raw: string): string {
  return linesFromField(raw).join(" | ");
}
