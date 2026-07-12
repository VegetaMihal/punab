export const JULY_AWARD_DEBATE_CATEGORY_KEY = "debate";
export const JULY_AWARD_DEBATE_PARTNER_LABEL = "Debate Forum";

export function isJulyAwardDebateClubCard(row: {
  category_key?: string | null;
  partner_label?: string | null;
}): boolean {
  if (row.category_key === JULY_AWARD_DEBATE_CATEGORY_KEY) return true;
  return row.partner_label?.trim() === JULY_AWARD_DEBATE_PARTNER_LABEL;
}
