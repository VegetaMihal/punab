import { NextResponse } from "next/server";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { issueCertificatePdf } from "@/lib/certificates/issue";

/** Chromium pack download + PDF render can exceed the default 10s on cold start. */
export const maxDuration = 60;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const item = await issueCertificatePdf(id);
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate certificate PDF";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
