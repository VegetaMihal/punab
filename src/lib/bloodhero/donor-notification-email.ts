/**
 * Resend-powered donor match email (server-only).
 */
import { getBloodHeroPublicBaseUrl, getBloodHeroResendFrom } from "@/lib/bloodhero/email-config";
import { getResendClient, isResendConfigured } from "@/lib/resend";
import { type BloodHeroResponseAction, signBloodHeroResponseToken } from "@/lib/bloodhero/response-token";

/** Email-specific CTAs: short titles + one-line context (confirm page + profile updates). */
const DONOR_EMAIL_ACTIONS: {
  action: BloodHeroResponseAction;
  title: string;
  hint: string;
}[] = [
  {
    action: "accept",
    title: "I can help with this request",
    hint: "Opens a secure page — nothing is saved until you confirm.",
  },
  {
    action: "block_3m",
    title: "I donated recently — pause requests for 3 months",
    hint: "We will extend your cooling-off period so you are not matched during that time.",
  },
  {
    action: "block_2m",
    title: "I donated recently — pause requests for 2 months",
    hint: "Same as above, with a two-month pause.",
  },
  {
    action: "block_1m",
    title: "I donated recently — pause requests for 1 month",
    hint: "Same as above, with a one-month pause.",
  },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type DonorMatchEmailContext = {
  donorName: string;
  notificationId: string;
  bloodGroup: string;
  district: string;
  donationLocation: string;
  plannedDonationAt: string;
  trackingNumber: string;
};

function buildActionLinks(notificationId: string, baseUrl: string): Record<BloodHeroResponseAction, string> {
  const actions: BloodHeroResponseAction[] = ["accept", "block_3m", "block_2m", "block_1m"];
  const out = {} as Record<BloodHeroResponseAction, string>;
  for (const act of actions) {
    const token = signBloodHeroResponseToken(notificationId, act);
    out[act] = `${baseUrl}/bloodhero/respond?t=${encodeURIComponent(token)}`;
  }
  return out;
}

function actionButtonHtml(title: string, url: string): string {
  const u = escapeHtml(url);
  const t = escapeHtml(title);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 6px 0;width:100%;max-width:420px;">
<tr><td style="border-radius:10px;background:#991b1b;">
<a href="${u}" style="display:block;padding:14px 18px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;text-align:center;line-height:1.35;">${t}</a>
</td></tr></table>`;
}

export function buildDonorMatchEmailHtml(ctx: DonorMatchEmailContext): { html: string; text: string } {
  const baseUrl = getBloodHeroPublicBaseUrl();
  const links = buildActionLinks(ctx.notificationId, baseUrl);

  const when = escapeHtml(
    new Date(ctx.plannedDonationAt).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  );

  const textLines: string[] = [
    `Hello ${escapeHtml(ctx.donorName)},`,
    ``,
    `BloodHero has a blood request that may match you. Below is a short summary — please only use the links if this email was meant for you.`,
    ``,
    `--- Request summary ---`,
    `Blood group needed: ${escapeHtml(ctx.bloodGroup)}`,
    `District: ${escapeHtml(ctx.district)}`,
    `Where: ${escapeHtml(ctx.donationLocation)}`,
    `When blood is needed: ${when}`,
    `Reference: ${escapeHtml(ctx.trackingNumber)}`,
    ``,
    `--- Pick ONE reply (each link opens a confirmation step) ---`,
    ``,
  ];

  const htmlActionBlocks: string[] = [];

  for (let i = 0; i < DONOR_EMAIL_ACTIONS.length; i++) {
    const row = DONOR_EMAIL_ACTIONS[i];
    const url = links[row.action];
    const n = i + 1;
    textLines.push(`${n}. ${row.title}`);
    textLines.push(`   ${row.hint}`);
    textLines.push(`   ${url}`);
    textLines.push(``);

    htmlActionBlocks.push(`<div style="margin:20px 0 0 0;">
${actionButtonHtml(row.title, url)}
<p style="margin:6px 0 0 0;font-size:13px;line-height:1.45;color:#71717a;max-width:420px;">${escapeHtml(row.hint)}</p>
</div>`);
  }

  textLines.push(`If this email reached you by mistake, you can ignore it.`);
  textLines.push(``);
  textLines.push(`— BloodHero (a PUNAB initiative)`);

  const text = textLines.join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="color-scheme" content="light"/><meta name="supported-color-schemes" content="light"/></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fafafa;padding:24px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
<tr><td style="padding:28px 24px 8px 24px;">
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">Hello ${escapeHtml(ctx.donorName)},</p>
<p style="margin:0 0 20px 0;font-size:15px;line-height:1.55;color:#3f3f46;">There is an <strong>urgent blood request</strong> we think you may be able to help with. Please read the summary, then <strong>tap one button only</strong>. Each choice opens a quick confirmation page — <strong>nothing is saved until you confirm</strong>.</p>
<h2 style="margin:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Request summary</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#f4f4f5;border-radius:8px;">
<tr><td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;"><span style="font-size:12px;color:#71717a;display:block;">Blood group</span><strong style="font-size:16px;">${escapeHtml(ctx.bloodGroup)}</strong></td></tr>
<tr><td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;"><span style="font-size:12px;color:#71717a;display:block;">District</span><span style="font-size:15px;">${escapeHtml(ctx.district)}</span></td></tr>
<tr><td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;"><span style="font-size:12px;color:#71717a;display:block;">Donation location</span><span style="font-size:15px;">${escapeHtml(ctx.donationLocation)}</span></td></tr>
<tr><td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;"><span style="font-size:12px;color:#71717a;display:block;">When blood is needed</span><span style="font-size:15px;">${when}</span></td></tr>
<tr><td style="padding:14px 16px;"><span style="font-size:12px;color:#71717a;display:block;">Reference</span><span style="font-size:14px;font-family:ui-monospace,monospace;">${escapeHtml(ctx.trackingNumber)}</span></td></tr>
</table>
<h2 style="margin:28px 0 4px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Your reply — choose one</h2>
<p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;color:#52525b;">Tap the option that fits you. You can change your mind until you press confirm on the next screen.</p>
${htmlActionBlocks.join("")}
<p style="margin:28px 0 0 0;font-size:13px;line-height:1.5;color:#71717a;">If you did not expect this message, you can safely ignore it.</p>
<p style="margin:20px 0 0 0;font-size:14px;color:#18181b;">— BloodHero <span style="color:#71717a;">(a PUNAB initiative)</span></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { html, text };
}

export async function sendDonorMatchEmail(to: string, ctx: DonorMatchEmailContext): Promise<void> {
  if (!isResendConfigured()) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const resend = getResendClient();
  const { html, text } = buildDonorMatchEmailHtml(ctx);
  const from = getBloodHeroResendFrom();

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `BloodHero: ${ctx.bloodGroup} blood needed in ${ctx.district}`,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Resend send failed");
  }
}
