import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { bulkDeleteCertificates, bulkUpdateCertificateStatus } from "@/lib/repositories";

const bulkSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1),
  action: z.enum(["archive", "revoke", "delete"]),
});

export async function POST(req: Request) {
  try {
    await assertAdminScope("certificates");
    const parsed = bulkSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result =
      parsed.data.action === "delete"
        ? await bulkDeleteCertificates(parsed.data.ids)
        : await bulkUpdateCertificateStatus(
            parsed.data.ids,
            parsed.data.action === "archive" ? "ARCHIVED" : "REVOKED",
          );
    return NextResponse.json({ ok: true, count: result.count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to run bulk action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

