import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { updateCertificate } from "@/lib/repositories";

const revokeSchema = z.object({
  reason: z.string().trim().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const body = revokeSchema.safeParse(await req.json().catch(() => ({})));
    if (!body.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const item = await updateCertificate(id, {
      status: "REVOKED",
      revokedAt: new Date(),
      revokedReason: body.data.reason || null,
    });
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to revoke certificate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
