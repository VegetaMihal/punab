import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

export function formatCertificateNumber(year: number, token: string): string {
  return `PUNAB-CERT-${year}-${token}`;
}

export async function getNextCertificateNumber(issueDate: Date): Promise<string> {
  const year = issueDate.getUTCFullYear();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = randomBytes(6).toString("hex").toUpperCase();
    const certificateNumber = formatCertificateNumber(year, token);
    const existing = await prisma.certificate.findUnique({
      where: { certificateNumber },
      select: { id: true },
    });
    if (!existing) {
      return certificateNumber;
    }
  }
  throw new Error("Unable to generate unique certificate number");
}
