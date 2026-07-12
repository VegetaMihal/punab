import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import {
  deleteCertificateTemplate,
  updateCertificateTemplate,
} from "@/lib/repositories";

const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  type: z.string().trim().nullable().optional(),
  htmlContent: z.string().min(1).optional(),
  cssContent: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    const parsed = updateTemplateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const item = await updateCertificateTemplate(id, parsed.data);
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("certificates");
    const { id } = await ctx.params;
    await deleteCertificateTemplate(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
