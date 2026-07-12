/**
 * Thank-you / welcome email when a donor is approved (pending → active) — server-only, Resend.
 * Separate from match-notification emails in `donor-notification-email.ts`.
 */
import { getBloodHeroResendFrom } from "@/lib/bloodhero/email-config";
import { getResendClient, isResendConfigured } from "@/lib/resend";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type DonorApprovalWelcomeContext = {
  donorName: string;
};

export function buildDonorApprovalWelcomeEmail(ctx: DonorApprovalWelcomeContext): {
  html: string;
  text: string;
  subject: string;
} {
  const name = escapeHtml(ctx.donorName.trim() || "there");
  const plainName = ctx.donorName.trim() || "there";
  const subject = "Welcome to BloodHero — you're approved";

  const text = `Hello ${plainName},

We're glad to let you know your BloodHero donor registration is approved. You're now part of a community-backed pool of volunteers who step up when blood is needed close to home.

BloodHero is a service by PUNAB. We connect donors and requests with care and clarity — no spam, no account to manage. If a need matches your profile, we'll email you a short summary and a simple, secure way to reply (yes, pause, or pass).

Thank you for standing with your community.

If you didn't sign up for BloodHero, you can ignore this email.

— BloodHero (a service by PUNAB)`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fafafa;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 24px 8px 24px;">
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">Hello ${name},</p>
<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#3f3f46;">We're glad to let you know your <strong>BloodHero</strong> donor registration is <strong>approved</strong>. You're now part of a community-backed pool of people who help when blood is needed nearby.</p>
<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#3f3f46;"><strong>BloodHero is a service by PUNAB.</strong> We match donors and requests with respect for your time. You don't need a separate login — we'll only use the contact details you gave us.</p>
<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#3f3f46;">When a need may fit your profile, we'll email you a brief summary and a secure way to respond — so you can say yes, ask for a pause, or decline without pressure.</p>
<p style="margin:0 0 20px 0;font-size:14px;line-height:1.5;color:#52525b;">Thank you for being there for others. If you didn't register with BloodHero, you can safely ignore this message.</p>
<p style="margin:0;font-size:14px;color:#18181b;">— BloodHero <span style="color:#71717a;">(a service by PUNAB)</span></p>
</td></tr>
<tr><td style="height:4px;background:#991b1b;"></td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { html, text, subject };
}

export type SendDonorApprovalWelcomeResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Sends welcome email. Does not throw — callers log failures; donor approval must not depend on this.
 */
export async function sendDonorApprovalWelcomeEmail(
  to: string,
  ctx: DonorApprovalWelcomeContext
): Promise<SendDonorApprovalWelcomeResult> {
  const trimmedTo = to.trim();
  if (!trimmedTo) {
    return { ok: false, reason: "missing recipient email" };
  }

  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY is not set" };
  }

  const resend = getResendClient();
  const { html, text, subject } = buildDonorApprovalWelcomeEmail(ctx);
  const from = getBloodHeroResendFrom();

  try {
    const { error } = await resend.emails.send({
      from,
      to: trimmedTo,
      subject,
      html,
      text,
    });

    if (error) {
      return { ok: false, reason: error.message || "Resend send failed" };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg };
  }
}
