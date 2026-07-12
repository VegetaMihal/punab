import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { JulyMemorialInvitationInput } from "@/lib/invitations/july-memorial-schema";
import {
  extractJulyMemorialBundledTemplate,
  inlineJulyMemorialBundledAssets,
  patchJulyMemorialInvitationHtml,
} from "@/lib/invitations/july-memorial-standalone-patch-core";

const filePath = path.join(process.cwd(), "public", "invitations", "july-memorial-standalone.html");

let cachedTemplate: { mtimeMs: number; content: string } | null = null;

function readStandaloneTemplate(): string {
  const mtimeMs = fs.statSync(filePath).mtimeMs;
  if (!cachedTemplate || cachedTemplate.mtimeMs !== mtimeMs) {
    cachedTemplate = { mtimeMs, content: fs.readFileSync(filePath, "utf8") };
  }
  return cachedTemplate.content;
}

/** Patched full standalone document (read from disk). Server-only — do not import from client components. */
export function renderJulyMemorialInvitationHtml(input: JulyMemorialInvitationInput): string {
  const bundle = readStandaloneTemplate();
  const template = extractJulyMemorialBundledTemplate(bundle);
  const patched = patchJulyMemorialInvitationHtml(template, input);
  return inlineJulyMemorialBundledAssets(patched, bundle);
}
