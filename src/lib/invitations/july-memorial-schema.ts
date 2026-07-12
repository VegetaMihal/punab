import { z } from "zod";

const line = z.string().trim();

/** Only fields admins may change; all event copy is fixed in the template. */
export const julyMemorialInvitationInputSchema = z.object({
  recipientName: line.min(1).max(200),
  recipientDesignation: line.max(200),
  recipientInstitution: line.min(1).max(300),
  /** Left twin — "— CONTACT PERSON —". */
  contactPerson: line.min(1).max(800),
  /** Right twin — "— SPECIAL CONTACT —". */
  specialContact: line.min(1).max(800),
  /** Renders the large Chief Guest variant of the guest block. */
  isChiefGuest: z.boolean().default(false),
});

export type JulyMemorialInvitationInput = z.infer<typeof julyMemorialInvitationInputSchema>;

export const julyMemorialInvitationResponseStatusSchema = z.enum(["CONFIRMED", "MAYBE", "NO"]);

export type JulyMemorialInvitationResponseStatusInput = z.infer<
  typeof julyMemorialInvitationResponseStatusSchema
>;

export const JULY_MEMORIAL_INVITATION_INPUT_DEFAULTS: JulyMemorialInvitationInput = {
  recipientName: "Prof. Dr. Ahsan Habib Chowdhury",
  recipientDesignation: "Vice-Chancellor",
  recipientInstitution: "North South University",
  contactPerson: "+8801605090655, Sadia Tasneem\nCommunication Moderator , PUNAB",
  specialContact: "+8801871846643, Rafikul Islam\nVice President , PUNAB",
  isChiefGuest: false,
};

/** Fresh copy for create form / reset — avoids stale module cache holding old sample strings. */
/** Display name for contact filters (no phone numbers). */
export function contactPersonDisplayName(contactPerson: string): string {
  const firstLine = contactPerson.split("\n")[0]?.trim() ?? contactPerson.trim();
  if (firstLine.includes(",")) {
    const afterComma = firstLine.split(",").slice(1).join(",").trim();
    if (afterComma && !/^\+?\d[\d\s-]*$/.test(afterComma)) {
      return afterComma;
    }
  }
  const withoutPhone = firstLine.replace(/^\+?\d[\d\s-]{8,}\s*,?\s*/i, "").trim();
  return withoutPhone || firstLine;
}

export function freshJulyMemorialInvitationDefaults(): JulyMemorialInvitationInput {
  return { ...JULY_MEMORIAL_INVITATION_INPUT_DEFAULTS };
}

/** Fix legacy sample/DB rows that still use the old contact person name. */
export function normalizeJulyMemorialInvitationInput(
  input: JulyMemorialInvitationInput,
): JulyMemorialInvitationInput {
  const contactPerson = input.contactPerson.includes("Sadiq Tasneem")
    ? input.contactPerson.replace(/Sadiq Tasneem/g, "Sadia Tasneem")
    : input.contactPerson;
  return contactPerson === input.contactPerson ? input : { ...input, contactPerson };
}

export function julyMemorialInvitationRowToInput(row: {
  recipientName: string;
  recipientDesignation: string;
  recipientInstitution: string;
  contactPerson: string;
  specialContact: string;
  isChiefGuest: boolean;
}): JulyMemorialInvitationInput {
  return normalizeJulyMemorialInvitationInput({
    recipientName: row.recipientName,
    recipientDesignation: row.recipientDesignation,
    recipientInstitution: row.recipientInstitution,
    contactPerson: row.contactPerson,
    specialContact: row.specialContact,
    isChiefGuest: row.isChiefGuest,
  });
}

export function mergeJulyMemorialInvitationInput(
  partial: Partial<JulyMemorialInvitationInput>,
): JulyMemorialInvitationInput {
  const next = { ...JULY_MEMORIAL_INVITATION_INPUT_DEFAULTS };
  const stringKeys = Object.keys(next).filter((k) => k !== "isChiefGuest") as Exclude<
    keyof JulyMemorialInvitationInput,
    "isChiefGuest"
  >[];
  for (const key of stringKeys) {
    const v = partial[key];
    if (typeof v === "string") {
      next[key] = v;
    }
  }
  if (typeof partial.isChiefGuest === "boolean") {
    next.isChiefGuest = partial.isChiefGuest;
  }
  return next;
}

export function julyMemorialInvitationInputFromRequestBody(body: unknown): JulyMemorialInvitationInput {
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const patch: Partial<JulyMemorialInvitationInput> = {};
  const stringKeys = Object.keys(JULY_MEMORIAL_INVITATION_INPUT_DEFAULTS).filter(
    (k) => k !== "isChiefGuest",
  ) as Exclude<keyof JulyMemorialInvitationInput, "isChiefGuest">[];
  for (const key of stringKeys) {
    const v = o[key as string];
    if (typeof v === "string") {
      patch[key] = v;
    }
  }
  if (typeof o.contactPerson !== "string" && typeof o.contactInformation === "string") {
    const t = o.contactInformation.trim();
    const idx = t.search(/\n(?=\+880)/);
    patch.contactPerson = idx === -1 ? t : t.slice(0, idx).trim();
  }
  if (typeof o.isChiefGuest === "boolean") {
    patch.isChiefGuest = o.isChiefGuest;
  }
  return mergeJulyMemorialInvitationInput(patch);
}
