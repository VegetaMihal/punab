import { renderInvitationPdfBuffer } from "@/lib/certificates/pdf";
import { renderJulyMemorialInvitationHtml } from "@/lib/invitations/july-memorial-invitation-html.server";
import type { JulyMemorialInvitationInput } from "@/lib/invitations/july-memorial-schema";

export function safeJulyMemorialInvitationFileBase(name: string): string {
  return (
    name
      .trim()
      .slice(0, 80)
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase() || "guest"
  );
}

export async function renderJulyMemorialInvitationPdfFromInput(
  input: JulyMemorialInvitationInput,
): Promise<Buffer> {
  const html = renderJulyMemorialInvitationHtml(input);
  return renderInvitationPdfBuffer(html);
}
