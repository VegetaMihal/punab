import { toCertificateEmailLog } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { CertificateEmailLog } from "@/types/database";

type CreateCertificateEmailLogInput = {
  certificateId: string;
  recipientEmail: string;
  subject?: string | null;
  status: string;
};

export async function createCertificateEmailLog(
  input: CreateCertificateEmailLogInput,
): Promise<CertificateEmailLog> {
  const row = await prisma.certificateEmailLog.create({
    data: {
      certificateId: input.certificateId,
      recipientEmail: input.recipientEmail,
      subject: input.subject ?? null,
      status: input.status,
    },
  });
  return toCertificateEmailLog(row);
}

export async function listCertificateEmailLogsByCertificateId(certificateId: string): Promise<CertificateEmailLog[]> {
  const rows = await prisma.certificateEmailLog.findMany({
    where: { certificateId },
    orderBy: { sentAt: "desc" },
  });
  return rows.map(toCertificateEmailLog);
}
