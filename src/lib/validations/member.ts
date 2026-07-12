import { z } from "zod";

export const applicationSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  universityId: z.string().optional(),
  universityOther: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  studentId: z.string().min(1, "Student ID is required"),
  session: z.string().min(1, "Session is required"),
  district: z.string().min(1, "District is required"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
