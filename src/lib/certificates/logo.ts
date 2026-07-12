import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_LOGO_PATH = "/branding/punab-logo-v2.png";

export function getCertificateLogoUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_PUNAB_LOGO_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalizedBase}${DEFAULT_LOGO_PATH}`;
}

export async function getCertificateLogoSource(): Promise<string> {
  const localLogoPath = path.join(process.cwd(), "public", "branding", "punab-logo-v2.png");
  try {
    const logoBuffer = await readFile(localLogoPath);
    return `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    const explicit = process.env.NEXT_PUBLIC_PUNAB_LOGO_URL?.trim();
    if (explicit) {
      return explicit;
    }
    return getCertificateLogoUrl();
  }
}
