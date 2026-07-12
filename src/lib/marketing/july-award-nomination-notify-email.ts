import { getResendClient, isResendConfigured } from "@/lib/resend";

export type JulyAwardNominationNotifyInput = {
  categoryKey: string;
  categoryName: string;
  partnerNo: string;
  submittedAtIso: string;
  clubName: string;
  universityName: string;
  clubSocialLink: string;
  logoUrl: string;
  mobileNumber: string;
  yearEstablished?: string;
  communicationEmail: string;
  activeMembersApprox?: string;
  eventsLast12Months: string;
  presidentName?: string;
  facultyRoleLabel: string;
  facultyContactName: string;
  facultyContactMobile: string;
  supportingDriveLinks: string;
  supportingPdfUrl: string;
};

function resolveJulyAwardNotifyTo(): string | null {
  const to =
    process.env.JULY_AWARD_NOTIFY_EMAIL?.trim() ||
    process.env.BLOODHERO_TEST_EMAIL?.trim() ||
    "punabofficial@gmail.com";
  return to || null;
}

function resolveJulyAwardMailFrom(): string {
  const from =
    process.env.JULY_AWARD_RESEND_FROM?.trim() ||
    process.env.CERTIFICATE_RESEND_FROM?.trim() ||
    process.env.BLOODHERO_RESEND_FROM?.trim();
  if (from) return from;
  if (process.env.NODE_ENV === "development") {
    return "PUNAB July Award <onboarding@resend.dev>";
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

function row(label: string, value: string): string {
  const v = value.trim() || "—";
  return `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;color:#3B4540">${escapeHtml(label)}</td><td style="padding:6px 0;vertical-align:top;color:#0E120F">${escapeHtml(v)}</td></tr>`;
}

function linkRow(label: string, href: string): string {
  const url = href.trim();
  if (!url) return row(label, "—");
  const safe = escapeHtml(url);
  return `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;color:#3B4540">${escapeHtml(label)}</td><td style="padding:6px 0;vertical-align:top"><a href="${safe}" style="color:#1B7F3A">${safe}</a></td></tr>`;
}

function buildHtml(input: JulyAwardNominationNotifyInput): string {
  const submitted = new Date(input.submittedAtIso);
  const when = Number.isNaN(submitted.getTime())
    ? input.submittedAtIso
    : submitted.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" });

  const rows = [
    row("Category", `${input.categoryName} (${input.categoryKey})`),
    row("Submitted", when),
    row("Partner N°", input.partnerNo),
    row("Club", input.clubName),
    row("University", input.universityName),
    linkRow("Club social", input.clubSocialLink),
    linkRow("Club logo", input.logoUrl),
    row("Mobile", input.mobileNumber),
    row("Communication email", input.communicationEmail),
    row("Year established", input.yearEstablished ?? ""),
    row("Active members (approx.)", input.activeMembersApprox ?? ""),
    row("Events (last 12 months)", input.eventsLast12Months),
    row("President", input.presidentName ?? ""),
    row("Faculty role", input.facultyRoleLabel),
    row("Faculty contact", input.facultyContactName),
    row("Faculty mobile", input.facultyContactMobile),
    linkRow("Supporting Drive link(s)", input.supportingDriveLinks),
    linkRow("Supporting PDF", input.supportingPdfUrl),
  ].join("");

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0E120F;background:#FFFCF5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e4d8;border-radius:12px;padding:24px">
  <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1B7F3A">July Uprising Memorial Award 2026</p>
  <h1 style="margin:0 0 16px;font-size:20px;color:#C8161E">New club nomination received</h1>
  <p style="margin:0 0 20px;color:#3B4540">A club has submitted the July Award nomination form. Details are below and in the Google Sheet.</p>
  <table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
  </div></body></html>`;
}

/** Notify PUNAB inbox when a club nomination is saved. Does not throw. */
export async function sendJulyAwardNominationNotifyEmail(
  input: JulyAwardNominationNotifyInput
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY is not configured." };
  }

  const to = resolveJulyAwardNotifyTo();
  if (!to) {
    return { ok: false, reason: "No notify recipient configured." };
  }

  const subject = `July Award 2026 — New nomination: ${input.clubName} (${input.categoryName})`;
  const html = buildHtml(input);

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: resolveJulyAwardMailFrom(),
      to: [to],
      replyTo: input.communicationEmail.trim() || undefined,
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
