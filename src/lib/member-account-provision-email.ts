/**
 * AUTH-003: temporary-password email sent when an admin approves a member application.
 */
import { getResendClient, isResendConfigured } from "@/lib/resend";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function memberResendFrom(): string {
  return (
    process.env.MEMBER_ACCOUNT_RESEND_FROM?.trim() ||
    process.env.CERTIFICATE_RESEND_FROM?.trim() ||
    process.env.BLOODHERO_RESEND_FROM?.trim() ||
    "PUNAB <no-reply@punab.com>"
  );
}

export type MemberAccountEmailContext = {
  fullName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
  expiryHours: number;
};

export function buildMemberAccountEmail(ctx: MemberAccountEmailContext): {
  html: string;
  text: string;
  subject: string;
} {
  const name = escapeHtml(ctx.fullName.trim() || "there");
  const plainName = ctx.fullName.trim() || "there";
  const subject = "Your PUNAB member account is ready";

  const text = `Hello ${plainName},

Your PUNAB membership application has been approved. A portal account has been created for you.

Login email: ${ctx.email}
Temporary password: ${ctx.tempPassword}

This password expires in ${ctx.expiryHours} hours and can only be used once. Log in and you will be asked to set your own password immediately.

Login: ${ctx.loginUrl}

If you did not apply for PUNAB membership, please ignore this email.

— PUNAB`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fafafa;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 24px 8px 24px;">
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">Hello ${name},</p>
<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#3f3f46;">Your <strong>PUNAB</strong> membership application has been approved. A portal account has been created for you.</p>
<table role="presentation" style="margin:0 0 14px 0;width:100%;background:#f4f4f5;border-radius:8px;">
<tr><td style="padding:12px 16px;font-size:14px;color:#18181b;">
<div>Login email: <strong>${escapeHtml(ctx.email)}</strong></div>
<div>Temporary password: <strong>${escapeHtml(ctx.tempPassword)}</strong></div>
</td></tr>
</table>
<p style="margin:0 0 14px 0;font-size:14px;line-height:1.55;color:#3f3f46;">This password expires in <strong>${ctx.expiryHours} hours</strong> and can only be used once. You'll be asked to set your own password right after logging in.</p>
<p style="margin:0 0 20px 0;"><a href="${escapeHtml(ctx.loginUrl)}" style="display:inline-block;background:#166534;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Log in</a></p>
<p style="margin:0;font-size:12px;line-height:1.5;color:#71717a;">If you did not apply for PUNAB membership, you can ignore this email.</p>
</td></tr>
<tr><td style="height:4px;background:#166534;"></td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { html, text, subject };
}

export type SendMemberAccountEmailResult = { ok: true } | { ok: false; reason: string };

export async function sendMemberAccountEmail(ctx: MemberAccountEmailContext): Promise<SendMemberAccountEmailResult> {
  const to = ctx.email.trim();
  if (!to) return { ok: false, reason: "missing recipient email" };
  if (!isResendConfigured()) return { ok: false, reason: "RESEND_API_KEY is not set" };

  const resend = getResendClient();
  const { html, text, subject } = buildMemberAccountEmail(ctx);

  try {
    const { error } = await resend.emails.send({
      from: memberResendFrom(),
      to,
      subject,
      html,
      text,
    });
    if (error) return { ok: false, reason: error.message || "Resend send failed" };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
