import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(7, "Enter your phone number"),
  universityId: z.string().uuid("Select a university"),
  department: z.string().min(2, "Enter your department"),
  studentId: z.string().min(2, "Enter your student ID"),
  session: z.string().min(2, "Enter your session"),
  district: z.string().min(2, "Enter your district"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
