export const JULY_AWARD_PARTNER_NO_PREFIX = "AP-2026";

/** e.g. 12 → `AP-2026-0012` */
export function formatJulyAwardPartnerNo(sequence: number): string {
  const n = Math.max(1, Math.min(9999, Math.floor(sequence)));
  return `${JULY_AWARD_PARTNER_NO_PREFIX}-${String(n).padStart(4, "0")}`;
}

export function isJulyAwardPartnerNo(value: string): boolean {
  return /^AP-2026-\d{4}$/.test(value.trim());
}

/** Stable fallback when Sheets is not configured (dev / offline). */
export function fallbackJulyAwardPartnerNo(clubName: string, universityName: string): string {
  const data = `${clubName.trim().toLowerCase()}|${universityName.trim().toLowerCase()}`;
  let h = 0;
  for (let i = 0; i < data.length; i += 1) {
    h = (Math.imul(31, h) + data.charCodeAt(i)) >>> 0;
  }
  return formatJulyAwardPartnerNo(1 + (h % 9999));
}
