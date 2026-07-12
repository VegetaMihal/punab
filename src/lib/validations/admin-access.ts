import { z } from "zod";

export const adminAssignedPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const adminAccessEmailSchema = z.object({
  email: z.string().trim().email(),
});

export const grantAdminAccessSchema = adminAccessEmailSchema.extend({
  password: adminAssignedPasswordSchema,
  invitations: z.coerce.boolean(),
  certificates: z.coerce.boolean(),
  julyAwardCards: z.coerce.boolean(),
  julyAwardParticipants: z.coerce.boolean(),
});

export const setAdminPasswordSchema = adminAccessEmailSchema.extend({
  password: adminAssignedPasswordSchema,
});

export const updateAdminAccessSchema = adminAccessEmailSchema.extend({
  invitations: z.coerce.boolean(),
  certificates: z.coerce.boolean(),
  julyAwardCards: z.coerce.boolean(),
  julyAwardParticipants: z.coerce.boolean(),
});
