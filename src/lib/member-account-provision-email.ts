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

With Regards,
Kazi Rohanuzzaman Mehal
PUNAB Technology & Innovation Forum`;

  // Same visual system as supabase/templates/recovery.html.
  const siteUrl = new URL(ctx.loginUrl).origin;
  const loginUrl = escapeHtml(ctx.loginUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f1;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f3f4f1;">Your membership is approved. Here are your login details.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f1;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4e7e1;">

  <tr>
    <td style="padding:0;font-size:0;line-height:0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="70%" height="6" style="background:#18572f;font-size:0;line-height:0;">&nbsp;</td>
          <td width="20%" height="6" style="background:#d72229;font-size:0;line-height:0;">&nbsp;</td>
          <td width="10%" height="6" style="background:#f9a72b;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:32px 32px 8px 32px;">
      <a href="${siteUrl}" style="text-decoration:none;">
        <img src="${siteUrl}/branding/punab-logo-v2.png" width="148" alt="PUNAB" style="display:block;width:148px;max-width:148px;height:auto;border:0;outline:none;">
      </a>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 36px 0 36px;">
      <p style="margin:0 0 10px 0;text-align:center;">
        <span style="display:inline-block;background:#e8f1eb;color:#18572f;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:5px 12px;border-radius:999px;">Membership approved</span>
      </p>
      <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:700;color:#14281c;text-align:center;">Welcome to PUNAB, ${name}</h1>
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#45514a;text-align:center;">Your membership application has been approved and your member portal account is ready.</p>
    </td>
  </tr>

  <tr>
    <td style="padding:0 36px 24px 36px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f8f5;border:1px solid #e4e7e1;border-radius:10px;">
        <tr>
          <td style="padding:16px 20px 6px 20px;font-size:12px;line-height:1.4;color:#7a857e;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Login email</td>
        </tr>
        <tr>
          <td style="padding:0 20px 14px 20px;font-size:15px;line-height:1.4;color:#14281c;font-weight:600;word-break:break-all;">${escapeHtml(ctx.email)}</td>
        </tr>
        <tr>
          <td style="padding:0 20px 6px 20px;font-size:12px;line-height:1.4;color:#7a857e;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;border-top:1px solid #e4e7e1;padding-top:14px;">Temporary password</td>
        </tr>
        <tr>
          <td style="padding:0 20px 16px 20px;font-size:17px;line-height:1.4;color:#14281c;font-weight:700;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;letter-spacing:0.04em;word-break:break-all;">${escapeHtml(ctx.tempPassword)}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:0 36px 28px 36px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="17%" stroke="f" fillcolor="#18572f">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Segoe UI,Arial,sans-serif;font-size:16px;font-weight:bold;">Log in to PUNAB</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${loginUrl}" style="display:inline-block;background:#18572f;color:#ffffff;font-size:16px;font-weight:700;line-height:48px;height:48px;padding:0 32px;border-radius:8px;text-decoration:none;mso-hide:all;">Log in to PUNAB</a>
      <!--<![endif]-->
    </td>
  </tr>

  <tr>
    <td style="padding:0 36px 28px 36px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fdf6e9;border-left:4px solid #f9a72b;border-radius:6px;">
        <tr>
          <td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#5b4a26;">
            <strong style="color:#3d3016;">This password expires in ${ctx.expiryHours} hours and works once.</strong>
            You'll be asked to choose your own password right after logging in. If you did not apply for PUNAB membership, you can ignore this email.
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 36px 32px 36px;">
      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.5;color:#45514a;">With Regards,</p>
      <p style="margin:0;font-size:15px;line-height:1.4;color:#14281c;font-weight:700;">Kazi Rohanuzzaman Mehal</p>
      <p style="margin:2px 0 0 0;font-size:13px;line-height:1.4;color:#18572f;font-weight:600;">PUNAB Technology &amp; Innovation Forum</p>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 36px 24px 36px;background:#f7f8f5;border-top:1px solid #e4e7e1;">
      <p style="margin:0 0 4px 0;font-size:12px;line-height:1.5;color:#45514a;font-weight:600;text-align:center;">Private University National Association of Bangladesh</p>
      <p style="margin:0 0 10px 0;font-size:11px;line-height:1.5;color:#7a857e;text-align:center;letter-spacing:0.08em;text-transform:uppercase;">Unity &middot; Mobilizing &middot; Progress</p>
      <p style="margin:0;font-size:12px;line-height:1.5;text-align:center;">
        <a href="${siteUrl}" style="color:#18572f;text-decoration:none;font-weight:600;">punab.com</a>
      </p>
    </td>
  </tr>

</table>
<p style="margin:16px 0 0 0;font-size:11px;line-height:1.5;color:#9aa39d;text-align:center;">You're receiving this because you applied for PUNAB membership.</p>
</td></tr>
</table>
</body>
</html>`;

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
