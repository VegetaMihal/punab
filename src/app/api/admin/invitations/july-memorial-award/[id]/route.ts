import { NextResponse } from "next/server";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { julyMemorialInvitationInputSchema } from "@/lib/invitations/july-memorial-schema";
import {
  deleteJulyMemorialInvitationById,
  getJulyMemorialInvitationById,
  updateJulyMemorialInvitation,
} from "@/lib/repositories/july-memorial-invitations-repository";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("invitations");
    const { id } = await ctx.params;
    const item = await getJulyMemorialInvitationById(id);
    if (!item) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("invitations");
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = julyMemorialInvitationInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const item = await updateJulyMemorialInvitation(id, parsed.data);
    if (!item) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update invitation";
    const status =
      message === "Another invitation already exists for this guest name and institution"
        ? 409
        : message === "Unauthorized"
          ? 401
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminScope("invitations");
    const { id } = await ctx.params;
    const existing = await getJulyMemorialInvitationById(id);
    if (!existing) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    const ok = await deleteJulyMemorialInvitationById(id);
    if (!ok) {
      return NextResponse.json({ error: "Failed to delete invitation" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete invitation";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
