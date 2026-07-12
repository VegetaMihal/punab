import { NextResponse } from "next/server";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { julyMemorialInvitationInputSchema } from "@/lib/invitations/july-memorial-schema";
import {
  listJulyMemorialInvitationsAdmin,
  upsertJulyMemorialInvitation,
} from "@/lib/repositories/july-memorial-invitations-repository";

export async function GET() {
  try {
    await assertAdminScope("invitations");
    const items = await listJulyMemorialInvitationsAdmin();
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await assertAdminScope("invitations");
    const json = await req.json();
    const parsed = julyMemorialInvitationInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { item, created } = await upsertJulyMemorialInvitation(parsed.data, user.id);
    return NextResponse.json({ item, created }, { status: created ? 201 : 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create invitation";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

