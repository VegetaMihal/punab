import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Turns an emailed Supabase link (password recovery, email confirmation) into a session.
 * `token_hash` links work on any device; `code` (PKCE) links only in the browser that requested them.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/auth/reset-password";
  // Only same-site paths — blocks open redirects like `@evil.com` or `//evil.com`.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/auth/reset-password";

  if (tokenHash && type) {
    const supabase = await createClient();
    await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  } else if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
