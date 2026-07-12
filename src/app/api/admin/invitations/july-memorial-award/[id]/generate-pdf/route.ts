import { NextResponse } from "next/server";
import { assertAdminScope } from "@/lib/auth/require-admin";
import {
  renderJulyMemorialInvitationPdfFromInput,
  safeJulyMemorialInvitationFileBase,
} from "@/lib/invitations/july-memorial-pdf.server";
import { julyMemorialInvitationRowToInput } from "@/lib/invitations/july-memorial-schema";
import {
  getJulyMemorialInvitationById,
  markJulyMemorialInvitationPdfGenerated,
} from "@/lib/repositories/july-memorial-invitations-repository";

export const maxDuration = 60;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("invitations");
    const { id } = await ctx.params;
    const row = await getJulyMemorialInvitationById(id);
    if (!row) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const input = julyMemorialInvitationRowToInput(row);
    const pdf = await renderJulyMemorialInvitationPdfFromInput(input);
    await markJulyMemorialInvitationPdfGenerated(id);

    const slug = safeJulyMemorialInvitationFileBase(row.recipientName);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="punab-invitation-${slug}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to render PDF";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
