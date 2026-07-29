import { getResendClient, isResendConfigured } from "@/lib/resend";

export type MonitoringNotifyInput = {
  referenceNumber: string;
  universityName: string;
  category: string;
  score: number;
};

function resolveMonitoringNotifyTo(): string | null {
  const to = process.env.MONITORING_FORM_NOTIFY_EMAIL?.trim() || "punabofficial@gmail.com";
  return to || null;
}

function resolveMonitoringMailFrom(): string {
  const from = process.env.JULY_AWARD_RESEND_FROM?.trim() || process.env.CERTIFICATE_RESEND_FROM?.trim();
  if (from) return from;
  if (process.env.NODE_ENV === "development") {
    return "PUNAB Monitoring <onboarding@resend.dev>";
  }
  return "PUNAB <noreply@punab.com>";
}

/** Notify PUNAB inbox when a monitoring submission is saved. Does not throw. */
export async function sendMonitoringSubmissionNotifyEmail(
  input: MonitoringNotifyInput
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY is not configured." };
  }
  const to = resolveMonitoringNotifyTo();
  if (!to) {
    return { ok: false, reason: "No notify recipient configured." };
  }

  const subject = `July Monitoring Form — New report ${input.referenceNumber} (${input.universityName})`;
  const html = `<!doctype html><html><body style="font-family:sans-serif;color:#1a1a1a">
  <h1 style="margin:0 0 16px;font-size:20px;color:#C8161E">New monitoring report received</h1>
  <p>Reference: <strong>${input.referenceNumber}</strong></p>
  <p>University: <strong>${input.universityName}</strong></p>
  <p>Score: ${input.score} — Preliminary category: ${input.category}</p>
  <p>Full details are in the master Google Sheet. Review at /admin/monitoring-form.</p>
  </body></html>`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: resolveMonitoringMailFrom(),
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
