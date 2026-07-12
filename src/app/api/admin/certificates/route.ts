import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import {
  createCertificate,
  listCertificatesAdmin,
} from "@/lib/repositories";

const createCertificateSchema = z.object({
  certificateTitle: z.string().trim().min(1),
  certificateType: z.string().trim().min(1),
  recipientName: z.string().trim().min(1),
  recipientEmail: z.string().email().optional().nullable(),
  universityName: z.string().trim().optional().nullable(),
  eventName: z.string().trim().optional().nullable(),
  role: z.string().trim().optional().nullable(),
  achievement: z.string().trim().optional().nullable(),
  timePeriod: z.string().trim().optional().nullable(),
  reason: z.string().trim().min(1),
  issueDate: z.coerce.date(),
  templateId: z.string().trim().min(1),
  signatoryName1: z.string().trim().optional().nullable(),
  signatoryDesignation1: z.string().trim().optional().nullable(),
  signatoryName2: z.string().trim().optional().nullable(),
  signatoryDesignation2: z.string().trim().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    await assertAdminScope("certificates");
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const items = await listCertificatesAdmin({
      query: searchParams.get("q") ?? undefined,
      status: (searchParams.get("status") as "DRAFT" | "ISSUED" | "EMAILED" | "REVOKED" | "ARCHIVED" | null) ?? undefined,
      certificateType: searchParams.get("type") ?? undefined,
      eventName: searchParams.get("event") ?? undefined,
      recipientName: searchParams.get("recipient") ?? undefined,
      fromDate: from ? new Date(from) : undefined,
      toDate: to ? new Date(to) : undefined,
    });
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await assertAdminScope("certificates");
    const json = await req.json();
    const parsed = createCertificateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const row = await createCertificate({
      ...parsed.data,
      createdById: user.id,
    });
    return NextResponse.json({ item: row }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create certificate";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

