import { getResendClient, isResendConfigured } from "@/lib/resend";

export type MunNotifyInput = {
  referenceNumber: string;
  fullName: string;
  email: string;
  institutionName: string;
  status: string;
};

function resolveMunNotifyTo(): string | null {
  const to = process.env.MUN_FORM_NOTIFY_EMAIL?.trim() || "punabinternationalmun@gmail.com";
  return to || null;
}

function resolveMunMailFrom(): string {
  const from = process.env.JULY_AWARD_RESEND_FROM?.trim() || process.env.CERTIFICATE_RESEND_FROM?.trim();
  if (from) return from;
  if (process.env.NODE_ENV === "development") {
    return "PUNAB IMUN <onboarding@resend.dev>";
  }
  return "PUNAB <noreply@punab.com>";
}

/** Notify PUNAB inbox on a new MUN application. Does not throw. */
export async function sendMunApplicationNotifyEmail(
  input: MunNotifyInput
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY is not configured." };
  }
  const to = resolveMunNotifyTo();
  if (!to) {
    return { ok: false, reason: "No notify recipient configured." };
  }

  const subject = `PUNAB IMUN 2026 — New application: ${input.fullName} (${input.referenceNumber})`;
  const html = `<!doctype html><html><body style="font-family:sans-serif;color:#1a1a1a">
  <h1 style="margin:0 0 16px;font-size:20px;color:#C8161E">New IMUN 2026 delegate application</h1>
  <p>Reference: <strong>${input.referenceNumber}</strong></p>
  <p>Name: <strong>${input.fullName}</strong></p>
  <p>Institution: ${input.institutionName}</p>
  <p>Email: ${input.email}</p>
  <p>Status: ${input.status}</p>
  <p>Full details are in the master Google Sheet. Review at /admin/mun-form.</p>
  </body></html>`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: resolveMunMailFrom(),
      to: [to],
      subject,
      html,
    });
    if (error) {
      return { ok: false, reason: error.message || "Resend send failed." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Email send failed." };
  }
}
