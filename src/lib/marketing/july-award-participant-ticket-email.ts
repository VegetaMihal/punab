import { getResendClient } from "@/lib/resend";

function resolveJulyAwardMailFrom(): string {
  const explicit = process.env.JULY_AWARD_RESEND_FROM?.trim();
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return "PUNAB <onboarding@resend.dev>";
  return "PUNAB <noreply@punab.com>";
}

export type SendJulyAwardTicketEmailInput = {
  recipientEmail: string;
  fullName: string;
  universityName: string;
  clubName: string;
  phoneNumber: string;
  ticketId: string;
  ticketUrl: string;
  qrCodePngBuffer: Buffer;
};

export async function sendJulyAwardParticipantTicketEmail(
  input: SendJulyAwardTicketEmailInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const resend = getResendClient();
    const subject = "Your July Uprising Memorial Award 2026 ticket";
    const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1f2937;line-height:1.6">
<p>Hello ${input.fullName},</p>
<p>Your registration for the July Uprising Memorial Award programme is confirmed. This is your entry ticket — please bring it (printed or on your phone) to the venue.</p>
<table style="margin:16px 0;border-collapse:collapse">
  <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Ticket ID</td><td><strong>${input.ticketId}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Name</td><td>${input.fullName}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#6b7280">University</td><td>${input.universityName}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Club</td><td>${input.clubName || "—"}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Phone</td><td>${input.phoneNumber}</td></tr>
</table>
<p><img src="cid:ticket-qr" alt="Ticket QR code" width="240" height="240" /></p>
<p>Scan this QR at the venue to verify your ticket.</p>
<p>Regards,<br/><strong>PUNAB Technology & Innovation Team</strong></p>
</body></html>`;
    const text = [
      `Hello ${input.fullName},`,
      "",
      "Your registration for the July Uprising Memorial Award programme is confirmed.",
      `Ticket ID: ${input.ticketId}`,
      `Name: ${input.fullName}`,
      `University: ${input.universityName}`,
      `Club: ${input.clubName || "—"}`,
      `Phone: ${input.phoneNumber}`,
      `Verify: ${input.ticketUrl}`,
      "",
      "Regards,",
      "PUNAB Technology & Innovation Team",
    ].join("\n");

    const { error } = await resend.emails.send({
      from: resolveJulyAwardMailFrom(),
      to: input.recipientEmail,
      subject,
      html,
      text,
      attachments: [
        {
          filename: "ticket-qr.png",
          content: input.qrCodePngBuffer,
          contentId: "ticket-qr",
        },
      ],
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Resend request failed." };
  }
}
