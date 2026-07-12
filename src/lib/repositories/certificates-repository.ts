import { Prisma } from "@prisma/client";
import { getNextCertificateNumber } from "@/lib/certificates/numbering";
import { toCertificate } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { Certificate, CertificateStatus } from "@/types/database";

export type ListCertificatesAdminFilters = {
  query?: string;
  status?: CertificateStatus;
  certificateType?: string;
  fromDate?: Date;
  toDate?: Date;
  eventName?: string;
  recipientName?: string;
};

export type CreateCertificateInput = {
  certificateTitle: string;
  certificateType: string;
  recipientName: string;
  recipientEmail?: string | null;
  universityName?: string | null;
  eventName?: string | null;
  role?: string | null;
  achievement?: string | null;
  timePeriod?: string | null;
  reason: string;
  issueDate: Date;
  templateId: string;
  signatoryName1?: string | null;
  signatoryDesignation1?: string | null;
  signatoryName2?: string | null;
  signatoryDesignation2?: string | null;
  signatorySignature1Url?: string | null;
  signatorySignature2Url?: string | null;
  customFields?: Prisma.InputJsonValue | null;
  createdById?: string | null;
};

export type UpdateCertificateInput = Partial<Omit<CreateCertificateInput, "createdById" | "templateId">> & {
  certificateNumber?: string;
  templateId?: string | null;
  pdfUrl?: string | null;
  verificationUrl?: string | null;
  status?: CertificateStatus;
  emailSentAt?: Date | null;
  revokedAt?: Date | null;
  revokedReason?: string | null;
};

export async function listCertificatesAdmin(filters: ListCertificatesAdminFilters = {}): Promise<Certificate[]> {
  const where: Prisma.CertificateWhereInput = {};
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.certificateType) {
    where.certificateType = filters.certificateType;
  }
  if (filters.eventName?.trim()) {
    where.eventName = { contains: filters.eventName.trim(), mode: "insensitive" };
  }
  if (filters.recipientName?.trim()) {
    where.recipientName = { contains: filters.recipientName.trim(), mode: "insensitive" };
  }
  if (filters.fromDate || filters.toDate) {
    where.issueDate = {
      ...(filters.fromDate ? { gte: filters.fromDate } : {}),
      ...(filters.toDate ? { lte: filters.toDate } : {}),
    };
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { certificateNumber: { contains: q, mode: "insensitive" } },
      { recipientName: { contains: q, mode: "insensitive" } },
      { certificateTitle: { contains: q, mode: "insensitive" } },
      { reason: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.certificate.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });
  return rows.map(toCertificate);
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  const row = await prisma.certificate.findUnique({ where: { id } });
  return row ? toCertificate(row) : null;
}

export async function getCertificateByNumber(certificateNumber: string): Promise<Certificate | null> {
  const row = await prisma.certificate.findUnique({ where: { certificateNumber } });
  return row ? toCertificate(row) : null;
}

export async function createCertificate(input: CreateCertificateInput): Promise<Certificate> {
  const certificateNumber = await getNextCertificateNumber(input.issueDate);
  const row = await prisma.certificate.create({
    data: {
      certificateNumber,
      certificateTitle: input.certificateTitle,
      certificateType: input.certificateType,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail ?? null,
      universityName: input.universityName ?? null,
      eventName: input.eventName ?? null,
      role: input.role ?? null,
      achievement: input.achievement ?? null,
      timePeriod: input.timePeriod ?? null,
      reason: input.reason,
      issueDate: input.issueDate,
      templateId: input.templateId,
      signatoryName1: input.signatoryName1 ?? null,
      signatoryDesignation1: input.signatoryDesignation1 ?? null,
      signatoryName2: input.signatoryName2 ?? null,
      signatoryDesignation2: input.signatoryDesignation2 ?? null,
      signatorySignature1Url: input.signatorySignature1Url ?? null,
      signatorySignature2Url: input.signatorySignature2Url ?? null,
      customFields: input.customFields ?? Prisma.JsonNull,
      createdById: input.createdById ?? null,
      status: "DRAFT",
    },
  });
  return toCertificate(row);
}

export async function updateCertificate(id: string, input: UpdateCertificateInput): Promise<Certificate> {
  const row = await prisma.certificate.update({
    where: { id },
    data: {
      certificateNumber: input.certificateNumber,
      certificateTitle: input.certificateTitle,
      certificateType: input.certificateType,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      universityName: input.universityName,
      eventName: input.eventName,
      role: input.role,
      achievement: input.achievement,
      timePeriod: input.timePeriod,
      reason: input.reason,
      issueDate: input.issueDate,
      templateId: input.templateId,
      pdfUrl: input.pdfUrl,
      verificationUrl: input.verificationUrl,
      status: input.status,
      signatoryName1: input.signatoryName1,
      signatoryDesignation1: input.signatoryDesignation1,
      signatoryName2: input.signatoryName2,
      signatoryDesignation2: input.signatoryDesignation2,
      signatorySignature1Url: input.signatorySignature1Url,
      signatorySignature2Url: input.signatorySignature2Url,
      customFields: input.customFields === null ? Prisma.JsonNull : input.customFields,
      emailSentAt: input.emailSentAt,
      revokedAt: input.revokedAt,
      revokedReason: input.revokedReason,
    },
  });
  return toCertificate(row);
}

export async function deleteCertificateById(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.certificateEmailLog.deleteMany({ where: { certificateId: id } });
    await tx.certificate.delete({ where: { id } });
  });
}

export async function bulkUpdateCertificateStatus(
  ids: string[],
  status: CertificateStatus,
): Promise<{ count: number }> {
  if (ids.length === 0) {
    return { count: 0 };
  }
  const result = await prisma.certificate.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      ...(status === "REVOKED" ? { revokedAt: new Date() } : {}),
    },
  });
  return { count: result.count };
}

export async function bulkDeleteCertificates(ids: string[]): Promise<{ count: number }> {
  if (ids.length === 0) {
    return { count: 0 };
  }
  const deletable = await prisma.certificate.findMany({
    where: {
      id: { in: ids },
      status: { in: ["DRAFT", "ARCHIVED"] },
    },
    select: { id: true },
  });
  const deletableIds = deletable.map((row) => row.id);
  if (deletableIds.length === 0) {
    return { count: 0 };
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.certificateEmailLog.deleteMany({
      where: { certificateId: { in: deletableIds } },
    });
    return tx.certificate.deleteMany({
      where: { id: { in: deletableIds } },
    });
  });
  return { count: result.count };
}
