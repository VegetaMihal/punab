import { NextResponse } from "next/server";
import { getCertificateByNumber } from "@/lib/repositories";

export async function GET(_req: Request, ctx: { params: Promise<{ certificateNumber: string }> }) {
  const { certificateNumber } = await ctx.params;
  const item = await getCertificateByNumber(certificateNumber);
  if (!item) {
    return NextResponse.json({ status: "NOT_FOUND", valid: false }, { status: 404 });
  }
  if (item.status === "DRAFT" || item.status === "ARCHIVED") {
    return NextResponse.json(
      {
        status: item.status,
        valid: false,
        certificateNumber: item.certificateNumber,
        recipientName: item.recipientName,
        certificateTitle: item.certificateTitle,
      },
      { status: 409 },
    );
  }
  if (item.status === "REVOKED") {
    return NextResponse.json({
      status: "REVOKED",
      valid: false,
      certificateNumber: item.certificateNumber,
      recipientName: item.recipientName,
      certificateTitle: item.certificateTitle,
      reason: item.reason,
      issueDate: item.issueDate,
    });
  }
  return NextResponse.json({
    status: "VALID",
    valid: true,
    certificateNumber: item.certificateNumber,
    recipientName: item.recipientName,
    certificateTitle: item.certificateTitle,
    reason: item.reason,
    issueDate: item.issueDate,
    authority: "Authorized by PUNAB",
  });
}
