import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { deleteCertificateById, getCertificateById, updateCertificate } from "@/lib/repositories";

const updateCertificateSchema = z.object({
  certificateTitle: z.string().trim().min(1).optional(),
  certificateType: z.string().trim().min(1).optional(),
  recipientName: z.string().trim().min(1).optional(),
  recipientEmail: z.string().email().nullable().optional(),
  universityName: z.string().trim().nullable().optional(),
  eventName: z.string().trim().nullable().optional(),
  role: z.string().trim().nullable().optional(),
  achievement: z.string().trim().nullable().optional(),
  timePeriod: z.string().trim().nullable().optional(),
  reason: z.string().trim().min(1).optional(),
  issueDate: z.coerce.date().optional(),
  templateId: z.string().trim().nullable().optional(),
  signatoryName1: z.string().trim().nullable().optional(),
  signatoryDesignation1: z.string().trim().nullable().optional(),
  signatoryName2: z.string().trim().nullable().optional(),
  signatoryDesignation2: z.string().trim().nullable().optional(),
  signatorySignature1Url: z.string().url().nullable().optional(),
  signatorySignature2Url: z.string().url().nullable().optional(),
  status: z.enum(["DRAFT", "ISSUED", "EMAILED", "REVOKED", "ARCHIVED"]).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const item = await getCertificateById(id);
    if (!item) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = updateCertificateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const item = await updateCertificate(id, parsed.data);
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update certificate";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const existing = await getCertificateById(id);
    if (!existing) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (existing.status !== "DRAFT" && existing.status !== "ARCHIVED") {
      return NextResponse.json(
        { error: "Only DRAFT or ARCHIVED certificates can be deleted" },
        { status: 409 },
      );
    }
    await deleteCertificateById(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete certificate";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
