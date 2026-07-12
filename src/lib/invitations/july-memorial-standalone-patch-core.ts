import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import {
  JULY_AWARD_2026_DAY_CLOCK,
  JULY_AWARD_2026_EVENT_DETAILS,
} from "@/lib/july-award-2026-event";
import type { JulyMemorialInvitationInput } from "@/lib/invitations/july-memorial-schema";

/** Shipped template `event-meta-sub` line (weekday + programme start). */
export function julyMemorialInvitationEventMetaSubLabel(): string {
  const weekday = JULY_AWARD_2026_EVENT_DETAILS.dateLabel.split(",")[0]?.trim() ?? "";
  const [hRaw, mRaw] = JULY_AWARD_2026_DAY_CLOCK.start.split(":");
  const h24 = Number.parseInt(hRaw ?? "0", 10);
  const m = Number.parseInt(mRaw ?? "0", 10);
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${weekday}, ${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

const JULY_MEMORIAL_INVITATION_LEGACY_DATE_LABELS = ["13 July 2026", "Monday, 13 July 2026"] as const;
const JULY_MEMORIAL_INVITATION_LEGACY_META_SUB_LABELS = [
  "Monday, 03:00 PM",
  "Monday, 3:00 PM",
  "Monday, 03:00 PM",
  "Monday, 3:00 PM",
] as const;

/** Sync invitation card date/time copy with `july-award-2026-event.ts` (PDF + bundle). */
export function applyJulyMemorialInvitationEventDetails(html: string): string {
  const { dateShortLabel } = JULY_AWARD_2026_EVENT_DETAILS;
  const metaSub = julyMemorialInvitationEventMetaSubLabel();
  let out = html;
  for (const legacy of JULY_MEMORIAL_INVITATION_LEGACY_DATE_LABELS) {
    out = out.split(legacy).join(dateShortLabel);
  }
  for (const legacy of JULY_MEMORIAL_INVITATION_LEGACY_META_SUB_LABELS) {
    out = out.split(legacy).join(metaSub);
  }
  return out;
}

type BundlerManifestEntry = {
  mime: string;
  data: string;
  compressed?: boolean;
};

/** Substrings that must exist exactly once in the shipped standalone bundle (guest + contact person). */
export const JULY_MEMORIAL_STANDALONE_NAME_MARKER = "Prof. Dr. Ahsan Habib Chowdhury";
export const JULY_MEMORIAL_STANDALONE_DESIGNATION_MARKER =
  "Vice-Chancellor &nbsp;·&nbsp; North South University";
export const JULY_MEMORIAL_STANDALONE_CONTACT1_MARKER =
  "<p>+8801605090655, Sadia Tasneem</p>\n        <span>Communication Moderator , PUNAB</span>";

export const JULY_MEMORIAL_STANDALONE_CONTACT2_MARKER =
  "<p>+8801871846643, Rafikul Islam</p>\n        <span>Vice President , PUNAB</span>";

export const JULY_MEMORIAL_STANDALONE_GUEST_BLOCK_MARKER = '<div class="guest-block">';

/** Escape for text embedded inside the outer JSON string of `__bundler/template`. */
export function escapeJsonTemplateFragment(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");
}

function escHtmlLite(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatGuestDesignationHtml(input: JulyMemorialInvitationInput): string {
  const d = input.recipientDesignation.trim();
  const i = input.recipientInstitution.trim();
  if (d) {
    return `${escHtmlLite(d)} &nbsp;·&nbsp; ${escHtmlLite(i)}`;
  }
  return escHtmlLite(i);
}

/** Contact person block: line 1 → <p>, line 2+ → <span>. */
export function formatContactPersonInnerHtml(text: string): string {
  const lines = text
    .trim()
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) {
    return "";
  }
  if (lines.length === 1) {
    return `<p>${escHtmlLite(lines[0])}</p>`;
  }
  return `<p>${escHtmlLite(lines[0])}</p>\n        <span>${escHtmlLite(lines.slice(1).join(" "))}</span>`;
}

function assertSingleOccurrence(haystack: string, needle: string, label: string) {
  const n = haystack.split(needle).length - 1;
  if (n !== 1) {
    throw new Error(`Invitation template ${label}: expected 1 occurrence of marker, found ${n}`);
  }
}

/** Asset bytes from `__bundler/manifest` (logo, fonts, etc.). */
export function extractJulyMemorialBundlerManifest(
  rawBundle: string,
): Record<string, BundlerManifestEntry> {
  const open = '<script type="__bundler/manifest">';
  const start = rawBundle.indexOf(open);
  if (start === -1) {
    throw new Error("Invitation bundle: missing __bundler/manifest script");
  }
  const contentStart = rawBundle.indexOf("\n", start) + 1;
  const contentEnd = rawBundle.indexOf("</script>", contentStart);
  if (contentEnd === -1) {
    throw new Error("Invitation bundle: unclosed __bundler/manifest script");
  }
  return JSON.parse(rawBundle.slice(contentStart, contentEnd).trim()) as Record<string, BundlerManifestEntry>;
}

export function bundlerManifestEntryToDataUrl(entry: BundlerManifestEntry): string {
  let bytes = Buffer.from(entry.data, "base64");
  if (entry.compressed) {
    bytes = gunzipSync(bytes);
  }
  return `data:${entry.mime};base64,${bytes.toString("base64")}`;
}

export const PUNAB_INVITATION_LOGO_PATH = "/invitations/july-memorial-logo.png";

const logoDataUrlCache = new Map<string, { mtimeMs: number; dataUrl: string }>();

function getLogoDataUrlForPath(filePath: string): string {
  const mtimeMs = statSync(filePath).mtimeMs;
  const hit = logoDataUrlCache.get(filePath);
  if (hit && hit.mtimeMs === mtimeMs) {
    return hit.dataUrl;
  }
  const bytes = readFileSync(filePath);
  const dataUrl = `data:image/png;base64,${bytes.toString("base64")}`;
  logoDataUrlCache.set(filePath, { mtimeMs, dataUrl });
  return dataUrl;
}

/** Inline logo for PDF; fonts load from Google Fonts in template. */
export function inlineJulyMemorialBundledAssets(html: string, rawBundle: string): string {
  let out = html;
  const pngPath = path.join(process.cwd(), "public", "invitations", "july-memorial-logo.png");
  if (out.includes(PUNAB_INVITATION_LOGO_PATH) && existsSync(pngPath)) {
    out = out.split(PUNAB_INVITATION_LOGO_PATH).join(getLogoDataUrlForPath(pngPath));
  }
  const manifest = extractJulyMemorialBundlerManifest(rawBundle);
  for (const [uuid, entry] of Object.entries(manifest)) {
    if (entry.mime.startsWith("image/")) {
      out = out.split(uuid).join(bundlerManifestEntryToDataUrl(entry));
    }
  }
  return out;
}

/** Inner invitation document from `public/.../july-memorial-standalone.html` bundler script tag. */
export function extractJulyMemorialBundledTemplate(rawBundle: string): string {
  const open = '<script type="__bundler/template">';
  const start = rawBundle.indexOf(open);
  if (start === -1) {
    throw new Error("Invitation bundle: missing __bundler/template script");
  }
  const contentStart = rawBundle.indexOf("\n", start) + 1;
  const contentEnd = rawBundle.indexOf("</script>", contentStart);
  if (contentEnd === -1) {
    throw new Error("Invitation bundle: unclosed __bundler/template script");
  }
  return JSON.parse(rawBundle.slice(contentStart, contentEnd).trim()) as string;
}

function patchJulyMemorialInvitationDocument(
  html: string,
  input: JulyMemorialInvitationInput,
  opts: { jsonEscape: boolean },
): string {
  assertSingleOccurrence(html, JULY_MEMORIAL_STANDALONE_NAME_MARKER, "guest name");
  assertSingleOccurrence(html, JULY_MEMORIAL_STANDALONE_DESIGNATION_MARKER, "designation");
  assertSingleOccurrence(html, JULY_MEMORIAL_STANDALONE_CONTACT1_MARKER, "contact person");
  assertSingleOccurrence(html, JULY_MEMORIAL_STANDALONE_CONTACT2_MARKER, "special contact");
  assertSingleOccurrence(html, JULY_MEMORIAL_STANDALONE_GUEST_BLOCK_MARKER, "guest block");

  const esc = opts.jsonEscape ? escapeJsonTemplateFragment : (s: string) => s;
  const inner1 = formatContactPersonInnerHtml(input.contactPerson);
  const inner2 = formatContactPersonInnerHtml(input.specialContact);

  let out = html;
  out = out.split(JULY_MEMORIAL_STANDALONE_NAME_MARKER).join(esc(input.recipientName));
  out = out.split(JULY_MEMORIAL_STANDALONE_DESIGNATION_MARKER).join(esc(formatGuestDesignationHtml(input)));
  out = out.split(JULY_MEMORIAL_STANDALONE_CONTACT1_MARKER).join(esc(inner1));
  out = out.split(JULY_MEMORIAL_STANDALONE_CONTACT2_MARKER).join(esc(inner2));
  if (input.isChiefGuest) {
    out = out
      .split(JULY_MEMORIAL_STANDALONE_GUEST_BLOCK_MARKER)
      .join(esc('<div class="guest-block guest-block--chief">'));
  }
  return applyJulyMemorialInvitationEventDetails(out);
}

/** Patched invitation HTML document for PDF / headless render (no bundler shell). */
export function patchJulyMemorialInvitationHtml(
  templateHtml: string,
  input: JulyMemorialInvitationInput,
): string {
  return patchJulyMemorialInvitationDocument(templateHtml, input, { jsonEscape: false });
}

/**
 * Patch the raw standalone bundle file (includes JSON-escaped `__bundler/template`).
 *
 * Guest, designation, contact person (left), and special contact (right) are substituted.
 */
export function patchJulyMemorialStandaloneTemplate(
  rawTemplate: string,
  input: JulyMemorialInvitationInput,
): string {
  return patchJulyMemorialInvitationDocument(rawTemplate, input, { jsonEscape: true });
}
