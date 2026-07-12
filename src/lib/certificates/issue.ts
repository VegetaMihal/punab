import {
  getCertificateById,
  getCertificateTemplateById,
  listActiveCertificateTemplates,
  updateCertificate,
} from "@/lib/repositories";
import { renderCertificatePdfBuffer } from "@/lib/certificates/pdf";
import { getCertificateLogoSource } from "@/lib/certificates/logo";
import { getNextCertificateNumber } from "@/lib/certificates/numbering";
import { generateCertificateQrCodeDataUrl } from "@/lib/certificates/qr";
import { uploadCertificatePdf } from "@/lib/certificates/storage";
import { resolveSignatureSrcForPdf } from "@/lib/certificates/signature-assets";
import { buildTemplateContext, renderCertificateHtml } from "@/lib/certificates/templates";
import { buildCertificateVerificationUrl } from "@/lib/certificates/verification";
import type { Certificate } from "@/types/database";

export async function issueCertificatePdf(certificateId: string): Promise<Certificate> {
  const certificate = await getCertificateById(certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }
  let templateId = certificate.templateId;
  if (!templateId) {
    const activeTemplates = await listActiveCertificateTemplates();
    if (activeTemplates.length === 0) {
      throw new Error("No active certificate template available");
    }
    templateId = activeTemplates[0].id;
    await updateCertificate(certificate.id, { templateId });
  }

  let certificateNumber = certificate.certificateNumber;
  if (!certificateNumber) {
    certificateNumber = await getNextCertificateNumber(new Date(certificate.issueDate));
    await updateCertificate(certificate.id, { certificateNumber });
  }

  const verificationUrl = buildCertificateVerificationUrl(certificateNumber);
  const qrCode = await generateCertificateQrCodeDataUrl(verificationUrl);
  let template = await getCertificateTemplateById(templateId);
  if (!template) {
    const activeTemplates = await listActiveCertificateTemplates();
    if (activeTemplates.length === 0) {
      throw new Error("No active certificate template available");
    }
    templateId = activeTemplates[0].id;
    await updateCertificate(certificate.id, { templateId });
    template = await getCertificateTemplateById(templateId);
    if (!template) {
      throw new Error("Certificate template not found");
    }
  }

  // Re-fetch so PDF reflects latest row if admin PATCHes while generation runs (stale snapshot → wrong PDF).
  const fresh = await getCertificateById(certificate.id);
  if (!fresh) {
    throw new Error("Certificate not found");
  }
  const hydrated: Certificate = { ...fresh, certificateNumber, verificationUrl };
  const resolvedTemplateId = fresh.templateId ?? templateId;
  let templateForRender = template;
  if (resolvedTemplateId && resolvedTemplateId !== template.id) {
    const t = await getCertificateTemplateById(resolvedTemplateId);
    if (!t) {
      throw new Error("Certificate template not found");
    }
    templateForRender = t;
  }
  const [sig1Src, sig2Src] = await Promise.all([
    resolveSignatureSrcForPdf(hydrated.signatorySignature1Url),
    resolveSignatureSrcForPdf(hydrated.signatorySignature2Url),
  ]);
  const context = buildTemplateContext({
    certificate: hydrated,
    verificationUrl,
    qrCode,
    logoUrl: await getCertificateLogoSource(),
    signatorySignature1Src: sig1Src,
    signatorySignature2Src: sig2Src,
  });
  const html = renderCertificateHtml(templateForRender, context);
  const pdfBuffer = await renderCertificatePdfBuffer(html);
  const uploaded = await uploadCertificatePdf({
    certificateNumber,
    pdfBuffer,
  });

  return updateCertificate(certificate.id, {
    certificateNumber,
    pdfUrl: uploaded.publicUrl,
    verificationUrl,
    status: "ISSUED",
  });
}
