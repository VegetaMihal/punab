import { z } from "zod";

export const julyInjuredStudentRegistrationFormSchema = z.object({
  fullName: z.string().trim().min(1, "Required"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Required")
    .regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid phone number"),
  universityName: z.string().trim().min(1, "Required"),
  injuryDescription: z.string().trim().min(1, "Required"),
});

export type JulyInjuredStudentRegistrationParsed = z.infer<typeof julyInjuredStudentRegistrationFormSchema>;
