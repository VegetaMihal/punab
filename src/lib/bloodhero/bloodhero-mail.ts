/**
 * BloodHero transactional email helper — uses `@/lib/resend` (server-only).
 * Donor approval / match templates can build HTML elsewhere and call `sendBloodHeroMail`.
 */
import { getResendClient } from "@/lib/resend";

/** Resend test domain — only delivers to your Resend account’s verified inbox. */
export const BLOODHERO_RESEND_TEST_FROM = "BloodHero <onboarding@resend.dev>";

export type BloodHeroMailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  from: string;
};

export type SendBloodHeroMailResult =
  | { ok: true; resendId?: string }
  | { ok: false; error: string };

/**
 * Low-level send. Does not throw; logs failures. Use for any BloodHero Resend message.
 */
export async function sendBloodHeroMail(payload: BloodHeroMailPayload): Promise<SendBloodHeroMailResult> {
  const to = payload.to.trim();
  if (!to) {
    console.error("[BloodHero:mail] rejected: empty recipient");
    return { ok: false, error: "recipient address is empty" };
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: payload.from,
      to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (error) {
      console.error("[BloodHero:mail] Resend API error", {
        message: error.message,
        to,
        subject: payload.subject,
      });
      return { ok: false, error: error.message || "Resend send failed" };
    }

    const resendId = data?.id;
    console.info("[BloodHero:mail] sent", { to, subject: payload.subject, resendId });
    return { ok: true, resendId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[BloodHero:mail] send exception", { message: msg, to, subject: payload.subject });
    return { ok: false, error: msg };
  }
}

const TEST_SUBJECT = "BloodHero test email (PUNAB)";

/**
 * Minimal test message for `/api/bloodhero/test-email`. Uses Resend onboarding sender.
 */
export async function sendBloodHeroTestEmail(to: string): Promise<SendBloodHeroMailResult> {
  const text = [
    "This is a test email from the PUNAB BloodHero integration.",
    "",
    "If you received this, RESEND_API_KEY and the test route are working.",
    "",
    "— BloodHero (a service by PUNAB)",
  ].join("\n");

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
<p>This is a <strong>test email</strong> from the PUNAB BloodHero integration.</p>
<p>If you received this, <code>RESEND_API_KEY</code> and the test route are working.</p>
<p style="color:#52525b;font-size:14px;">— BloodHero <span style="color:#71717a;">(a service by PUNAB)</span></p>
</body></html>`;

  return sendBloodHeroMail({
    to,
    from: BLOODHERO_RESEND_TEST_FROM,
    subject: TEST_SUBJECT,
    html,
    text,
  });
}
