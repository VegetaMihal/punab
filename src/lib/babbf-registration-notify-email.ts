import { getResendClient, isResendConfigured } from "@/lib/resend";

export type BabbfNotifyInput = {
  referenceNumber: string;
  fullName: string;
  email: string;
  universityName: string;
  status: string;
};

function resolveBabbfNotifyTo(): string | null {
  const to = process.env.BABBF_REGISTRATION_NOTIFY_EMAIL?.trim() || null;
  return to || null;
}

function resolveBabbfMailFrom(): string {
  const from = process.env.BABBF_REGISTRATION_RESEND_FROM?.trim();
  if (from) return from;
  if (process.env.NODE_ENV === "development") {
    return "BABBF Championship <onboarding@resend.dev>";
  }
  return "BABBF Championship <noreply@punab.com>";
}

export type BabbfConfirmationInput = {
  referenceNumber: string;
  fullName: string;
  email: string;
  eventTypeLabel: string;
  ticketUrl: string;
  qrCodePngBuffer: Buffer;
};

/** Notify the participant their registration is confirmed, with a scannable check-in QR. Does not throw. */
export async function sendBabbfConfirmationEmail(
  input: BabbfConfirmationInput
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY is not configured." };
  }
  if (!input.email) {
    return { ok: false, reason: "Registration has no email address on file." };
  }

  const subject = `You're confirmed — BABBF Championship 2026 (${input.eventTypeLabel})`;
  const html = `<!doctype html><html><body style="font-family:sans-serif;color:#1a1a1a">
  <h1 style="margin:0 0 16px;font-size:20px;color:#C8161E">Registration confirmed</h1>
  <p>Hi ${input.fullName},</p>
  <p>Your registration for the <strong>${input.eventTypeLabel}</strong> event at the BABBF Inter-University
  Armwrestler &amp; Fitness Championship 2026 has been <strong>confirmed</strong>.</p>
  <p>Event date: <strong>27 September 2026</strong> · KIB Convention Hall, Farmgate, Dhaka-1215</p>
  <p>Participant ID: <strong>${input.referenceNumber}</strong></p>
  <p><img src="cid:babbf-ticket-qr" alt="Ticket QR code" width="240" height="240" /></p>
  <p>Bring this QR (printed or on your phone) — it will be scanned for check-in and weight-in on event day.</p>
  <p>Regards,<br/><strong>Kazi Rohanuzzaman Mehal</strong><br/>PUNAB Technology &amp; Innovation Forum</p>
  </body></html>`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: resolveBabbfMailFrom(),
      to: [input.email],
      subject,
      html,
      attachments: [
        {
          filename: "babbf-ticket-qr.png",
          content: input.qrCodePngBuffer,
          contentId: "babbf-ticket-qr",
        },
      ],
    });
    if (error) {
      return { ok: false, reason: error.message || "Resend send failed." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Email send failed." };
  }
}

/** Notify the organizing inbox on a new BABBF registration. Does not throw. */
export async function sendBabbfRegistrationNotifyEmail(
  input: BabbfNotifyInput
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY is not configured." };
  }
  const to = resolveBabbfNotifyTo();
  if (!to) {
    return { ok: false, reason: "No notify recipient configured." };
  }

  const subject = `BABBF Championship 2026 — New registration: ${input.fullName} (${input.referenceNumber})`;
  const html = `<!doctype html><html><body style="font-family:sans-serif;color:#1a1a1a">
  <h1 style="margin:0 0 16px;font-size:20px;color:#C8161E">New BABBF Championship 2026 registration</h1>
  <p>Reference: <strong>${input.referenceNumber}</strong></p>
  <p>Name: <strong>${input.fullName}</strong></p>
  <p>University: ${input.universityName}</p>
  <p>Email: ${input.email}</p>
  <p>Status: ${input.status}</p>
  <p>Full details are in the master Google Sheet. Review at /admin/babbf-registrations.</p>
  </body></html>`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: resolveBabbfMailFrom(),
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
