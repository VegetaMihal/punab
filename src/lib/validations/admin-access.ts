import { z } from "zod";

export const adminAccessEmailSchema = z.object({
  email: z.string().trim().email(),
});

export const adminTitleSchema = z.enum(["central_forum_secretary", "central_committee_officer"]).nullable();

export const grantAdminAccessSchema = z.object({
  memberId: z.string().uuid("Pick a member from the list"),
  invitations: z.coerce.boolean(),
  certificates: z.coerce.boolean(),
  julyAwardCards: z.coerce.boolean(),
  julyAwardParticipants: z.coerce.boolean(),
  orgPortal: z.coerce.boolean(),
  adminTitle: z.preprocess((v) => (v === "" ? null : v), adminTitleSchema).optional(),
});

export const updateAdminAccessSchema = adminAccessEmailSchema.extend({
  invitations: z.coerce.boolean(),
  certificates: z.coerce.boolean(),
  julyAwardCards: z.coerce.boolean(),
  julyAwardParticipants: z.coerce.boolean(),
  orgPortal: z.coerce.boolean(),
  adminTitle: z.preprocess((v) => (v === "" ? null : v), adminTitleSchema).optional(),
});
