const MAX_LEN = 140;

/** Plain truncation at a word boundary; no AI. */
export function summarizeCondition(text: string | null | undefined): string | null {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.length <= MAX_LEN) return t;
  const cut = t.slice(0, MAX_LEN);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
