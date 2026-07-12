// Groups free-text names (university/club) that refer to the same entity but were typed
// differently across registrations — case/whitespace, common abbreviations, and small typos.

/** Known abbreviation -> canonical full name, matched after deep normalization. Extend as new variants surface. */
const NAME_ALIASES: Record<string, string> = {
  du: "Dhaka University",
  buet: "Bangladesh University of Engineering and Technology",
  ju: "Jahangirnagar University",
  cu: "University of Chittagong",
  ru: "University of Rajshahi",
  nsu: "North South University",
  northsouthuniversityofbangladesh: "North South University",
  manaratinternationaluniversityashulia: "Manarat International University",
  brac: "BRAC University",
  aiub: "American International University-Bangladesh",
  daffodil: "Daffodil International University",
  diu: "Daffodil International University",
  ewu: "East West University",
  iub: "Independent University, Bangladesh",
  uiu: "United International University",
  greenuniversity: "Green University of Bangladesh",
  greenuniversityofbangladesh: "Green University of Bangladesh",
  buft: "BGMEA University of Fashion and Technology",
  bgmeauniversityoffashionandtechnology: "BGMEA University of Fashion and Technology",
  "bgmeauniversityoffashion&technologybuft": "BGMEA University of Fashion and Technology",
  bubt: "Bangladesh University of Business and Technology",
  southeast: "Southeast University",
  gonobishwabidyalay: "Gono Bishwabidyalay",
  gonobishwabidyalaysavardhaka: "Gono Bishwabidyalay",
  iubat: "IUBAT - International University of Business Agriculture and Technology",
  internationaluniversityofbusinessagricultureandtechnology:
    "IUBAT - International University of Business Agriculture and Technology",
  "iubat-internationaluniversityofbusinessagricultureandtechnology":
    "IUBAT - International University of Business Agriculture and Technology",
  adust: "Atish Dipankar University of Science and Technology",
  atishdipankaruniversityofscienceandtechnology: "Atish Dipankar University of Science and Technology",
  atishdipankaruniversity: "Atish Dipankar University of Science and Technology",
  atishdepankaruniversity: "Atish Dipankar University of Science and Technology",
  atishdipankarscienceoftechnology: "Atish Dipankar University of Science and Technology",
  "atishdipankaruniversityofscience&technology": "Atish Dipankar University of Science and Technology",
  atishdipongkoruniversityofscienceandtechnology: "Atish Dipankar University of Science and Technology",
};

function deepNormalize(name: string): string {
  let s = name.trim().toLowerCase();
  s = s.replace(/[.,'"()]/g, "");
  s = s.replace(/\buniv\b/g, "university");
  s = s.replace(/\buni\b/g, "university");
  s = s.replace(/\bcollg\b/g, "college");
  s = s.replace(/\bdept\b/g, "department");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function aliasCanonical(name: string): string | null {
  const key = deepNormalize(name).replace(/\s+/g, "");
  return NAME_ALIASES[key] ?? null;
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** True if two already-deep-normalized strings are close enough to be the same typo'd entity. */
function isNearMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 4) return false; // too short to safely fuzzy-match (e.g. "DU" vs "JU")
  const distance = levenshtein(a, b);
  return distance <= Math.floor(maxLen * 0.15);
}

/** True if two raw name strings (typos, case, abbreviations aside) refer to the same real-world entity. */
export function namesMatch(a: string, b: string): boolean {
  const canonical = (name: string) => {
    const alias = aliasCanonical(name);
    return alias ? deepNormalize(alias) : deepNormalize(name);
  };
  return isNearMatch(canonical(a), canonical(b));
}

/**
 * Groups raw name variants into clusters of the same real-world entity.
 * Returns a map from each original raw name to its cluster's canonical display label
 * (the most frequent original spelling, or an alias's canonical name when matched).
 */
export function buildNameClusterMap(rawNames: string[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const raw of rawNames) counts.set(raw, (counts.get(raw) ?? 0) + 1);

  type Cluster = { normKeys: string[]; alias: string | null; labelCounts: Map<string, number> };
  const clusters: Cluster[] = [];

  for (const [raw, count] of counts) {
    const norm = deepNormalize(raw);
    const alias = aliasCanonical(raw);

    let target = clusters.find((c) => (alias && c.alias === alias) || c.normKeys.some((k) => isNearMatch(k, norm)));
    if (!target) {
      target = { normKeys: [], alias, labelCounts: new Map() };
      clusters.push(target);
    }
    if (alias && !target.alias) target.alias = alias;
    target.normKeys.push(norm);
    target.labelCounts.set(raw, (target.labelCounts.get(raw) ?? 0) + count);
  }

  const rawToLabel = new Map<string, string>();
  for (const cluster of clusters) {
    let label = cluster.alias;
    if (!label) {
      let best = "";
      let bestCount = -1;
      for (const [raw, count] of cluster.labelCounts) {
        if (count > bestCount) {
          best = raw;
          bestCount = count;
        }
      }
      label = best;
    }
    for (const raw of cluster.labelCounts.keys()) rawToLabel.set(raw, label);
  }
  return rawToLabel;
}
