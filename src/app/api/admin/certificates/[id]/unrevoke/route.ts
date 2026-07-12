import { NextResponse } from "next/server";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { getCertificateById, updateCertificate } from "@/lib/repositories";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const certificate = await getCertificateById(id);
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (certificate.status !== "REVOKED") {
      return NextResponse.json({ error: "Only REVOKED certificates can be unrevoked" }, { status: 409 });
    }

    const restoredStatus = certificate.emailSentAt
      ? "EMAILED"
      : certificate.pdfUrl
        ? "ISSUED"
        : "DRAFT";

    const item = await updateCertificate(id, {
      status: restoredStatus,
      revokedAt: null,
      revokedReason: null,
    });
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to unrevoke certificate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
