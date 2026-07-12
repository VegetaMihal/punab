export const JULY_AWARD_PARTICIPATION_PREFILL_KEY = "july-award-participation-prefill";

export type JulyAwardParticipationPrefill = {
  clubName: string;
  universityName: string;
  logoUrl: string;
  partnerNo: string;
  /** Debate lane uses fixed label Debate Forum instead of AP-2026-#### */
  debateForum?: boolean;
};

export function saveJulyAwardParticipationPrefill(data: JulyAwardParticipationPrefill): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(JULY_AWARD_PARTICIPATION_PREFILL_KEY, JSON.stringify(data));
}

/** One-time read after club nomination redirect. */
export function consumeJulyAwardParticipationPrefill(): JulyAwardParticipationPrefill | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(JULY_AWARD_PARTICIPATION_PREFILL_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(JULY_AWARD_PARTICIPATION_PREFILL_KEY);
  try {
    const parsed = JSON.parse(raw) as JulyAwardParticipationPrefill;
    if (
      typeof parsed.clubName === "string" &&
      typeof parsed.universityName === "string" &&
      typeof parsed.logoUrl === "string" &&
      typeof parsed.partnerNo === "string" &&
      parsed.logoUrl.trim() &&
      parsed.partnerNo.trim()
    ) {
      return {
        clubName: parsed.clubName.trim(),
        universityName: parsed.universityName.trim(),
        logoUrl: parsed.logoUrl.trim(),
        partnerNo: parsed.partnerNo.trim(),
        debateForum: parsed.debateForum === true,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}
