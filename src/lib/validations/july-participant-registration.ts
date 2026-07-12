import { z } from "zod";

export const julyParticipantRegistrationFormSchema = z.object({
  fullName: z.string().trim().min(1, "Required"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Required")
    .regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid phone number"),
  email: z.string().trim().min(1, "Required").email("Enter a valid email"),
  universityName: z.string().trim().min(1, "Required"),
  clubMode: z.enum(["select", "other"]),
  clubName: z.string().trim(),
  departmentOrRole: z.string().trim().min(1, "Required"),
  martyrsPledge: z.literal("on", { message: "Required" }),
  donatesBlood: z.enum(["yes", "no"], { message: "Required" }),
  bloodGroup: z.string().trim(),
  attendanceConfirm: z.literal("on", { message: "Required" }),
})
  .refine((d) => d.clubMode !== "select" || d.clubName.length > 0, {
    message: "Required",
    path: ["clubName"],
  })
  .refine((d) => d.donatesBlood !== "yes" || d.bloodGroup.length > 0, {
    message: "Required",
    path: ["bloodGroup"],
  });

export type JulyParticipantRegistrationParsed = z.infer<typeof julyParticipantRegistrationFormSchema>;
