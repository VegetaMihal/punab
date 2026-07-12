import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import {
  createCertificateTemplate,
  listCertificateTemplatesAdmin,
} from "@/lib/repositories";

const createTemplateSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  type: z.string().trim().nullable().optional(),
  htmlContent: z.string().min(1),
  cssContent: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await assertAdminScope("certificates");
    const items = await listCertificateTemplatesAdmin();
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
}

export async function POST(req: Request) {
  try {
    await assertAdminScope("certificates");
    const parsed = createTemplateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const item = await createCertificateTemplate(parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

