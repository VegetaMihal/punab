import { toCertificateTemplate } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { CertificateTemplate } from "@/types/database";

export type CreateCertificateTemplateInput = {
  name: string;
  slug: string;
  type?: string | null;
  htmlContent: string;
  cssContent?: string | null;
  isActive?: boolean;
};

export type UpdateCertificateTemplateInput = Partial<CreateCertificateTemplateInput>;

export async function listCertificateTemplatesAdmin(): Promise<CertificateTemplate[]> {
  const rows = await prisma.certificateTemplate.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  return rows.map(toCertificateTemplate);
}

export async function listActiveCertificateTemplates(): Promise<CertificateTemplate[]> {
  const rows = await prisma.certificateTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return rows.map(toCertificateTemplate);
}

export async function getCertificateTemplateById(id: string): Promise<CertificateTemplate | null> {
  const row = await prisma.certificateTemplate.findUnique({
    where: { id },
  });
  return row ? toCertificateTemplate(row) : null;
}

export async function getCertificateTemplateBySlug(slug: string): Promise<CertificateTemplate | null> {
  const row = await prisma.certificateTemplate.findUnique({
    where: { slug },
  });
  return row ? toCertificateTemplate(row) : null;
}

export async function createCertificateTemplate(input: CreateCertificateTemplateInput): Promise<CertificateTemplate> {
  const row = await prisma.certificateTemplate.create({
    data: {
      name: input.name,
      slug: input.slug,
      type: input.type ?? null,
      htmlContent: input.htmlContent,
      cssContent: input.cssContent ?? null,
      isActive: input.isActive ?? true,
    },
  });
  return toCertificateTemplate(row);
}

export async function updateCertificateTemplate(
  id: string,
  input: UpdateCertificateTemplateInput,
): Promise<CertificateTemplate> {
  const row = await prisma.certificateTemplate.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      type: input.type,
      htmlContent: input.htmlContent,
      cssContent: input.cssContent,
      isActive: input.isActive,
    },
  });
  return toCertificateTemplate(row);
}

export async function deleteCertificateTemplate(id: string): Promise<void> {
  await prisma.certificateTemplate.delete({ where: { id } });
}
