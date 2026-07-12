import { getResendClient } from "@/lib/resend";
import {
  createCertificateEmailLog,
  updateCertificate,
} from "@/lib/repositories";
import type { Certificate } from "@/types/database";

type SendCertificateEmailInput = {
  certificate: Certificate;
  pdfBuffer: Buffer;
};

function resolveCertificateMailFrom(): string {
  const explicitCertificateFrom = process.env.CERTIFICATE_RESEND_FROM?.trim();
  if (explicitCertificateFrom) {
    return explicitCertificateFrom;
  }

  const sharedFrom = process.env.BLOODHERO_RESEND_FROM?.trim();
  if (sharedFrom) {
    return sharedFrom;
  }

  if (process.env.NODE_ENV === "development") {
    return "PUNAB <onboarding@resend.dev>";
  }

  return "PUNAB <noreply@punab.com>";
}

export async function sendCertificateEmail(input: SendCertificateEmailInput): Promise<{ ok: boolean; error?: string }> {
  const recipient = input.certificate.recipientEmail?.trim() ?? "";
  if (!recipient) {
    await createCertificateEmailLog({
      certificateId: input.certificate.id,
      recipientEmail: "",
      subject: "Your PUNAB Certificate Has Been Issued",
      status: "FAILED: missing recipient email",
    });
    return { ok: false, error: "Recipient email missing" };
  }

  try {
    const resend = getResendClient();
    const subject = "Your PUNAB Certificate Has Been Issued";
    const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1f2937;line-height:1.6"><p>Hello ${input.certificate.recipientName},</p><p>Your certificate has been issued by PUNAB.</p><p>Certificate Number: <strong>${input.certificate.certificateNumber}</strong></p><p>You can verify it anytime from: ${input.certificate.verificationUrl ?? ""}</p><p>Regards,<br/>PUNAB</p></body></html>`;
    const text = [
      `Hello ${input.certificate.recipientName},`,
      "",
      "Your certificate has been issued by PUNAB.",
      `Certificate Number: ${input.certificate.certificateNumber}`,
      `Verification: ${input.certificate.verificationUrl ?? ""}`,
      "",
      "Regards,",
      "PUNAB",
    ].join("\n");

    const { error } = await resend.emails.send({
      from: resolveCertificateMailFrom(),
      to: recipient,
      subject,
      html,
      text,
      attachments: [
        {
          filename: `${input.certificate.certificateNumber}.pdf`,
          content: input.pdfBuffer,
        },
      ],
    });

    if (error) {
      await createCertificateEmailLog({
        certificateId: input.certificate.id,
        recipientEmail: recipient,
        subject,
        status: `FAILED: ${error.message}`,
      });
      return { ok: false, error: error.message };
    }

    await createCertificateEmailLog({
      certificateId: input.certificate.id,
      recipientEmail: recipient,
      subject,
      status: "SENT",
    });
    await updateCertificate(input.certificate.id, {
      status: "EMAILED",
      emailSentAt: new Date(),
    });
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await createCertificateEmailLog({
      certificateId: input.certificate.id,
      recipientEmail: recipient,
      subject: "Your PUNAB Certificate Has Been Issued",
      status: `FAILED: ${error}`,
    });
    return { ok: false, error };
  }
}
