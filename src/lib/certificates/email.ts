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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCertificateEmailHtml(certificate: Certificate, verificationUrl: string): string {
  const issueDate = new Date(certificate.issueDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const safeName = escapeHtml(certificate.recipientName);
  const safeTitle = escapeHtml(certificate.certificateTitle);
  const safeNumber = escapeHtml(certificate.certificateNumber ?? "");
  const safeUrl = escapeHtml(verificationUrl);

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#FFFCF5;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0E120F;line-height:1.6">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8e4d8;border-radius:12px;overflow:hidden">
  <div style="background:#C8161E;padding:20px 28px">
    <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#ffffff">PUNAB</p>
  </div>
  <div style="padding:28px">
    <h1 style="margin:0 0 16px;font-size:20px;color:#0E120F">Your Certificate Has Been Issued</h1>
    <p style="margin:0 0 12px;color:#3B4540">Dear ${safeName},</p>
    <p style="margin:0 0 16px;color:#3B4540">On behalf of PUNAB, we are pleased to present you with the following certificate:</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px;margin:0 0 20px;background:#FFFCF5;border:1px solid #e8e4d8;border-radius:8px">
      <tr><td style="padding:10px 14px;font-weight:600;color:#3B4540;width:40%">Certificate</td><td style="padding:10px 14px;color:#0E120F">${safeTitle}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;color:#3B4540">Certificate No.</td><td style="padding:10px 14px;color:#0E120F">${safeNumber}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;color:#3B4540">Issue Date</td><td style="padding:10px 14px;color:#0E120F">${issueDate}</td></tr>
    </table>
    <p style="margin:0 0 20px;color:#3B4540">The certificate is attached to this email as a PDF for your records.</p>
    ${
      safeUrl
        ? `<p style="margin:0 0 24px"><a href="${safeUrl}" style="display:inline-block;background:#1B7F3A;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px">Verify Certificate</a></p>`
        : ""
    }
    <p style="margin:0 0 4px;color:#3B4540">Congratulations, and thank you for being part of PUNAB.</p>
    <p style="margin:20px 0 0;color:#3B4540">Warm regards,<br/><strong>Kazi Rohanuzzaman Mehal</strong><br/>PUNAB Technology &amp; Innovation Team</p>
  </div>
  <div style="padding:16px 28px;border-top:1px solid #e8e4d8">
    <p style="margin:0;font-size:12px;color:#8a8578">This is an automated message from PUNAB. Please do not reply directly to this email.</p>
  </div>
</div>
</body></html>`;
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
    const subject = `Your Certificate from PUNAB — ${input.certificate.certificateTitle}`;
    const verificationUrl = input.certificate.verificationUrl ?? "";
    const html = buildCertificateEmailHtml(input.certificate, verificationUrl);
    const text = [
      `Dear ${input.certificate.recipientName},`,
      "",
      `On behalf of PUNAB, we are pleased to present you with the "${input.certificate.certificateTitle}" certificate.`,
      "",
      `Certificate Number: ${input.certificate.certificateNumber}`,
      `Issue Date: ${new Date(input.certificate.issueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
      input.certificate.reason ? `Reason: ${input.certificate.reason}` : "",
      "",
      "The certificate is attached to this email as a PDF. You may verify its authenticity anytime at:",
      verificationUrl,
      "",
      "Congratulations, and thank you for being part of PUNAB.",
      "",
      "Warm regards,",
      "Kazi Rohanuzzaman Mehal",
      "PUNAB Technology & Innovation Team",
    ]
      .filter(Boolean)
      .join("\n");

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
