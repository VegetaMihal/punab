import { after } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { runBloodHeroMatchingForRequest } from "@/lib/bloodhero/matching";
import { sendBloodHeroDonorNotificationsForRequest } from "@/lib/bloodhero/send-donor-notifications";

export const runtime = "nodejs";

const bodySchema = z.object({
  requestId: z.string().uuid(),
});

/**
 * POST /api/bloodhero/matching/run
 * Body: { "requestId": "<uuid>" }
 * Header: Authorization: Bearer <BLOODHERO_MATCHING_RUN_SECRET>
 *
 * Re-runs the same engine as the post-insert trigger (useful for ops/cron).
 */
export async function POST(req: Request) {
  const secret = process.env.BLOODHERO_MATCHING_RUN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "BloodHero matching run is not configured (BLOODHERO_MATCHING_RUN_SECRET)." },
      { status: 503 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body: requestId (uuid) required" }, { status: 400 });
  }

  const result = await runBloodHeroMatchingForRequest(parsed.data.requestId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  if (result.inserted > 0) {
    after(async () => {
      try {
        const r = await sendBloodHeroDonorNotificationsForRequest(result.requestId);
        if (r.errors.length > 0 && process.env.NODE_ENV === "development") {
          console.warn("[BloodHero] donor notification send (post-match):", r.errors);
        }
      } catch (e) {
        console.error("[BloodHero] donor notification send failed (post-match)", e);
      }
    });
  }

  return NextResponse.json(result);
}
