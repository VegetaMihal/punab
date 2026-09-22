import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runEscalationSweep } from "@/lib/bloodhero/run-escalation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * GET /api/bloodhero/run-escalation — called by the Vercel cron (vercel.json).
 * Auth: `x-escalation-secret` or `Authorization: Bearer` matching BLOODHERO_MATCHING_RUN_SECRET.
 * Vercel cron sends CRON_SECRET as the Bearer token, so set CRON_SECRET to the same value.
 */
export async function GET(req: Request) {
  const secrets = [process.env.BLOODHERO_MATCHING_RUN_SECRET, process.env.CRON_SECRET].filter(
    (s): s is string => Boolean(s?.trim())
  );
  if (secrets.length === 0) {
    return NextResponse.json({ error: "Escalation is not configured (BLOODHERO_MATCHING_RUN_SECRET)." }, { status: 503 });
  }

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const header = req.headers.get("x-escalation-secret") ?? "";
  const ok = secrets.some((s) => (bearer && safeEqual(bearer, s)) || (header && safeEqual(header, s)));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sweep = await runEscalationSweep();
  if (sweep.error) return NextResponse.json({ error: sweep.error }, { status: 500 });
  return NextResponse.json({ checked: sweep.checked, ran: sweep.ran, results: sweep.results });
}
