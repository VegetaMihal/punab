import { z } from "zod";

export const MONITORING_CONNECTIONS = [
  "student",
  "former_student",
  "teacher_staff",
  "alumni",
  "other",
] as const;
export type MonitoringConnection = (typeof MONITORING_CONNECTIONS)[number];

export const MONITORING_CONNECTION_LABEL: Record<MonitoringConnection, string> = {
  student: "Student",
  former_student: "Former student",
  teacher_staff: "Teacher or staff",
  alumni: "Alumni",
  other: "Other",
};

export const MONITORING_PROGRAM_STATUSES = [
  "official",
  "student_supported",
  "student_unsupported",
  "restricted",
  "no_program",
  "not_sure",
] as const;
export type MonitoringProgramStatus = (typeof MONITORING_PROGRAM_STATUSES)[number];

export const MONITORING_PROGRAM_STATUS_LABEL: Record<MonitoringProgramStatus, string> = {
  official: "Official programme",
  student_supported: "Student programme with support",
  student_unsupported: "Student programme without support",
  restricted: "Programme stopped or restricted",
  no_program: "No visible programme",
  not_sure: "Not sure",
};

export const MONITORING_OBSERVATIONS = [
  "program_held",
  "martyrs_honoured",
  "official_post",
  "no_initiative",
  "permission_refused",
  "posters_removed",
  "students_pressured",
  "trustee_interference",
  "other",
] as const;
export type MonitoringObservation = (typeof MONITORING_OBSERVATIONS)[number];

export const MONITORING_OBSERVATION_LABEL: Record<MonitoringObservation, string> = {
  program_held: "Programme held",
  martyrs_honoured: "Martyrs honoured",
  official_post: "Official post",
  no_initiative: "No initiative",
  permission_refused: "Permission refused",
  posters_removed: "Posters removed",
  students_pressured: "Students pressured",
  trustee_interference: "Trustee or administration interference",
  other: "Other",
};

export const MONITORING_SUPPORT_ANSWERS = ["yes", "no", "not_sure"] as const;
export type MonitoringSupportAnswer = (typeof MONITORING_SUPPORT_ANSWERS)[number];

export const MONITORING_SUPPORTER_REASONS = [
  "party_position",
  "public_support",
  "action_against_protesters",
  "obstruction",
  "threats",
  "disrespectful_statement",
  "other",
] as const;
export type MonitoringSupporterReason = (typeof MONITORING_SUPPORTER_REASONS)[number];

export const MONITORING_SUPPORTER_REASON_LABEL: Record<MonitoringSupporterReason, string> = {
  party_position: "Party position",
  public_support: "Public support",
  action_against_protesters: "Action against July protesters",
  obstruction: "Obstruction",
  threats: "Threats",
  disrespectful_statement: "Disrespectful statement",
  other: "Other",
};

export const MONITORING_EVIDENCE_ANSWERS = ["yes", "no", "later"] as const;
export type MonitoringEvidenceAnswer = (typeof MONITORING_EVIDENCE_ANSWERS)[number];

export const MONITORING_STATUSES = [
  "New",
  "Under Review",
  "Verified",
  "Rejected",
  "Duplicate",
] as const;
export type MonitoringStatus = (typeof MONITORING_STATUSES)[number];

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s === undefined || s === "" ? "" : s));

export const monitoringFormSchema = z
  .object({
    universityName: z.string().trim().min(2, "University name is required"),
    connection: z.enum(MONITORING_CONNECTIONS, {
      error: () => ({ message: "Choose your connection to the university." }),
    }),
    connectionOther: optionalTrimmed,
    programStatus: z.enum(MONITORING_PROGRAM_STATUSES, {
      error: () => ({ message: "Choose the July 2026 status." }),
    }),
    observations: z
      .array(z.enum(MONITORING_OBSERVATIONS))
      .min(1, "Select at least one observation"),
    observationsOther: optionalTrimmed,
    hasAdminSupporters: z.enum(MONITORING_SUPPORT_ANSWERS, {
      error: () => ({ message: "Choose Yes, No, or Not sure." }),
    }),
    supporterName: optionalTrimmed,
    supporterPosition: optionalTrimmed,
    supporterReasons: z.array(z.enum(MONITORING_SUPPORTER_REASONS)).optional().default([]),
    supporterReasonsOther: optionalTrimmed,
    description: optionalTrimmed,
    hasEvidence: z.enum(MONITORING_EVIDENCE_ANSWERS, {
      error: () => ({ message: "Choose Yes, No, or Can provide later." }),
    }),
    evidenceLinkNote: optionalTrimmed,
    contactOk: z.boolean().default(false),
    contactDetails: optionalTrimmed,
    keepConfidential: z.boolean().default(true),
    declarationAccepted: z.literal(true, {
      error: () => ({ message: "You must confirm the declaration to submit." }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.connection === "other" && !data.connectionOther) {
      ctx.addIssue({
        code: "custom",
        message: "Describe your connection.",
        path: ["connectionOther"],
      });
    }
    if (data.observations.includes("other") && !data.observationsOther) {
      ctx.addIssue({
        code: "custom",
        message: "Describe what you observed.",
        path: ["observationsOther"],
      });
    }
    if (data.hasAdminSupporters === "yes") {
      if (!data.supporterName) {
        ctx.addIssue({ code: "custom", message: "Supporter's name is required.", path: ["supporterName"] });
      }
      if (!data.supporterPosition) {
        ctx.addIssue({ code: "custom", message: "Supporter's position is required.", path: ["supporterPosition"] });
      }
      if (data.supporterReasons.length === 0) {
        ctx.addIssue({ code: "custom", message: "Select at least one reason.", path: ["supporterReasons"] });
      }
      if (data.supporterReasons.includes("other") && !data.supporterReasonsOther) {
        ctx.addIssue({
          code: "custom",
          message: "Describe the reason.",
          path: ["supporterReasonsOther"],
        });
      }
    }
  });

export type MonitoringFormParsed = z.infer<typeof monitoringFormSchema>;
