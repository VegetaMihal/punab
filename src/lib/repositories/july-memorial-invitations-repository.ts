import { Prisma } from "@prisma/client";
import { toJulyMemorialInvitation } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { JulyMemorialInvitation, JulyMemorialInvitationResponseStatus } from "@/types/database";

export const JULY_MEMORIAL_INVITATION_TEMPLATE_SLUG = "july-memorial-award";

export type JulyMemorialInvitationFieldsInput = {
  recipientName: string;
  recipientDesignation: string;
  recipientInstitution: string;
  contactPerson: string;
  specialContact: string;
  isChiefGuest: boolean;
};

export async function listJulyMemorialInvitationsAdmin(
  templateSlug = JULY_MEMORIAL_INVITATION_TEMPLATE_SLUG,
): Promise<JulyMemorialInvitation[]> {
  const rows = await prisma.julyMemorialInvitation.findMany({
    where: { templateSlug },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map(toJulyMemorialInvitation);
}

export async function getJulyMemorialInvitationById(id: string): Promise<JulyMemorialInvitation | null> {
  const row = await prisma.julyMemorialInvitation.findUnique({ where: { id } });
  return row ? toJulyMemorialInvitation(row) : null;
}

export async function upsertJulyMemorialInvitation(
  input: JulyMemorialInvitationFieldsInput,
  createdById?: string | null,
  templateSlug = JULY_MEMORIAL_INVITATION_TEMPLATE_SLUG,
): Promise<{ item: JulyMemorialInvitation; created: boolean }> {
  const name = input.recipientName.trim();
  const institution = input.recipientInstitution.trim();
  const existing = await prisma.julyMemorialInvitation.findUnique({
    where: {
      templateSlug_recipientName_recipientInstitution: {
        templateSlug,
        recipientName: name,
        recipientInstitution: institution,
      },
    },
    select: { id: true },
  });

  const row = await prisma.julyMemorialInvitation.upsert({
    where: {
      templateSlug_recipientName_recipientInstitution: {
        templateSlug,
        recipientName: name,
        recipientInstitution: institution,
      },
    },
    create: {
      templateSlug,
      recipientName: name,
      recipientDesignation: input.recipientDesignation.trim(),
      recipientInstitution: institution,
      contactPerson: input.contactPerson.trim(),
      specialContact: input.specialContact.trim(),
      isChiefGuest: input.isChiefGuest,
      createdById: createdById ?? null,
    },
    update: {
      recipientDesignation: input.recipientDesignation.trim(),
      contactPerson: input.contactPerson.trim(),
      specialContact: input.specialContact.trim(),
      isChiefGuest: input.isChiefGuest,
    },
  });
  return { item: toJulyMemorialInvitation(row), created: !existing };
}

export async function updateJulyMemorialInvitation(
  id: string,
  input: Partial<JulyMemorialInvitationFieldsInput>,
): Promise<JulyMemorialInvitation | null> {
  const data: Prisma.JulyMemorialInvitationUpdateInput = {};
  if (input.recipientName !== undefined) {
    data.recipientName = input.recipientName.trim();
  }
  if (input.recipientDesignation !== undefined) {
    data.recipientDesignation = input.recipientDesignation.trim();
  }
  if (input.recipientInstitution !== undefined) {
    data.recipientInstitution = input.recipientInstitution.trim();
  }
  if (input.contactPerson !== undefined) {
    data.contactPerson = input.contactPerson.trim();
  }
  if (input.specialContact !== undefined) {
    data.specialContact = input.specialContact.trim();
  }
  if (input.isChiefGuest !== undefined) {
    data.isChiefGuest = input.isChiefGuest;
  }
  try {
    const row = await prisma.julyMemorialInvitation.update({ where: { id }, data });
    return toJulyMemorialInvitation(row);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("Another invitation already exists for this guest name and institution");
    }
    return null;
  }
}

export async function markJulyMemorialInvitationPdfGenerated(id: string): Promise<void> {
  await prisma.julyMemorialInvitation.update({
    where: { id },
    data: { pdfGeneratedAt: new Date() },
  });
}

export async function deleteJulyMemorialInvitationById(id: string): Promise<boolean> {
  try {
    await prisma.julyMemorialInvitation.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function updateJulyMemorialInvitationResponseStatus(
  id: string,
  responseStatus: JulyMemorialInvitationResponseStatus,
): Promise<JulyMemorialInvitation | null> {
  try {
    const row = await prisma.julyMemorialInvitation.update({
      where: { id },
      data: { responseStatus },
    });
    return toJulyMemorialInvitation(row);
  } catch {
    return null;
  }
}
