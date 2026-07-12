/**
 * BloodHero email / public URL helpers (server-only).
 */

export function getBloodHeroPublicBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }
  return "http://localhost:3000";
}

export function getBloodHeroResendFrom(): string {
  const from = process.env.BLOODHERO_RESEND_FROM?.trim();
  if (from) {
    return from;
  }
  return "BloodHero <onboarding@resend.dev>";
}
