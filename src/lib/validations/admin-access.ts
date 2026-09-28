import { z } from "zod";
import { ADMIN_ROLES, GRANTABLE_ADMIN_SCOPES } from "@/lib/auth/admin-access";
import type { AdminScope } from "@/types/database";

export const adminAccessEmailSchema = z.object({
  email: z.string().trim().email(),
});

export const adminTitleSchema = z.enum(["central_forum_secretary", "central_committee_officer"]).nullable();

const scopeSchema = z.enum(GRANTABLE_ADMIN_SCOPES as [AdminScope, ...AdminScope[]]);
const ROLE_KEYS = ADMIN_ROLES.map((r) => r.key);
// "" = Full admin (the <select>'s default option).
const roleSchema = z.enum(ROLE_KEYS as [string, ...string[]]).or(z.literal("custom")).or(z.literal(""));

// role: a preset key from ADMIN_ROLES, or "custom" to use `scopes` (FormData.getAll("scopes")) directly.
const scopeFields = {
  role: roleSchema,
  scopes: z.array(scopeSchema).default([]),
  orgPortal: z.coerce.boolean(),
  adminTitle: z.preprocess((v) => (v === "" ? null : v), adminTitleSchema).optional(),
};

export const grantAdminAccessSchema = z.object({
  memberId: z.string().uuid("Pick a member from the list"),
  ...scopeFields,
});

export const updateAdminAccessSchema = adminAccessEmailSchema.extend(scopeFields);
