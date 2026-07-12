import { NextResponse } from "next/server";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { renderCertificatePdfBuffer } from "@/lib/certificates/pdf";
import { sendCertificateEmail } from "@/lib/certificates/email";
import { getCertificateLogoSource } from "@/lib/certificates/logo";
import { getCertificateById, getCertificateTemplateById } from "@/lib/repositories";
import { resolveSignatureSrcForPdf } from "@/lib/certificates/signature-assets";
import { buildTemplateContext, renderCertificateHtml } from "@/lib/certificates/templates";
import { generateCertificateQrCodeDataUrl } from "@/lib/certificates/qr";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const certificate = await getCertificateById(id);
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (!certificate.templateId) {
      return NextResponse.json({ error: "Template is required" }, { status: 400 });
    }

    const template = await getCertificateTemplateById(certificate.templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    const verifyUrl = certificate.verificationUrl ?? "";
    const qrCode = verifyUrl ? await generateCertificateQrCodeDataUrl(verifyUrl) : "";
    const [sig1Src, sig2Src] = await Promise.all([
      resolveSignatureSrcForPdf(certificate.signatorySignature1Url),
      resolveSignatureSrcForPdf(certificate.signatorySignature2Url),
    ]);
    const html = renderCertificateHtml(
      template,
      buildTemplateContext({
        certificate,
        verificationUrl: verifyUrl,
        qrCode,
        logoUrl: await getCertificateLogoSource(),
        signatorySignature1Src: sig1Src,
        signatorySignature2Src: sig2Src,
      }),
    );
    const pdfBuffer = await renderCertificatePdfBuffer(html);
    const emailResult = await sendCertificateEmail({ certificate, pdfBuffer });

    return NextResponse.json({ ok: emailResult.ok, error: emailResult.error ?? null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send certificate email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
