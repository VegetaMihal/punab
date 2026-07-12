import { NextResponse } from "next/server";
import { sendBloodHeroTestEmail } from "@/lib/bloodhero/bloodhero-mail";
import { isResendConfigured } from "@/lib/resend";

/**
 * GET /api/bloodhero/test-email
 * Sends a single test message to BLOODHERO_TEST_EMAIL using onboarding@resend.dev.
 * Gated: development only, or BLOODHERO_ALLOW_TEST_EMAIL=1 / true.
 */
function logBloodHeroEnvDiagnostics(context: string): void {
  if (process.env.NODE_ENV !== "development") return;
  const raw = process.env.RESEND_API_KEY;
  const trimmed = raw?.trim();
  console.info("[BloodHero:test-email] env diagnostics", {
    context,
    resendKeyDefined: raw !== undefined,
    resendKeyLengthAfterTrim: trimmed?.length ?? 0,
    testEmailDefined: Boolean(process.env.BLOODHERO_TEST_EMAIL?.trim()),
    nextCwd: process.cwd(),
  });
}

export async function GET() {
  const isDev = process.env.NODE_ENV === "development";
  const allowFlag = process.env.BLOODHERO_ALLOW_TEST_EMAIL?.trim();
  const allowExplicit =
    allowFlag === "1" || allowFlag?.toLowerCase() === "true" || allowFlag?.toLowerCase() === "yes";

  logBloodHeroEnvDiagnostics("request start");

  if (!isDev && !allowExplicit) {
    console.warn(
      "[BloodHero:test-email] blocked (not NODE_ENV=development and BLOODHERO_ALLOW_TEST_EMAIL not enabled)",
    );
    return NextResponse.json(
      {
        success: false,
        error:
          "Test email route is disabled. Use local dev, or set BLOODHERO_ALLOW_TEST_EMAIL=1 (staging only).",
      },
      { status: 403 },
    );
  }

  if (!isResendConfigured()) {
    console.error("[BloodHero:test-email] RESEND_API_KEY is not set");
    return NextResponse.json(
      {
        success: false,
        error: "RESEND_API_KEY is missing or empty.",
      },
      { status: 400 },
    );
  }

  const to = process.env.BLOODHERO_TEST_EMAIL?.trim();
  if (!to) {
    console.warn("[BloodHero:test-email] BLOODHERO_TEST_EMAIL is not set");
    return NextResponse.json(
      {
        success: false,
        error: "BLOODHERO_TEST_EMAIL is not set. Add it to .env.local for the recipient address.",
      },
      { status: 400 },
    );
  }

  const result = await sendBloodHeroTestEmail(to);

  if (!result.ok) {
    const body: Record<string, unknown> = { success: false };
    if (isDev) {
      body.error = result.error;
      body.hint =
        "Check RESEND_API_KEY, Resend dashboard domain limits, and that onboarding@resend.dev can reach your account email.";
    } else {
      body.error = "Resend send failed. See server logs for details.";
    }
    console.error("[BloodHero:test-email] send failed", { to, error: result.error });
    return NextResponse.json(body, { status: 502 });
  }

  console.info("[BloodHero:test-email] success", { to, resendId: result.resendId });
  return NextResponse.json({
    success: true,
    to,
    resendId: result.resendId ?? null,
    message: "Test email accepted by Resend. Check the inbox for BLOODHERO_TEST_EMAIL.",
  });
}
