export type BloodHeroCriticality = "normal" | "urgent" | "critical";

const RANK: Record<BloodHeroCriticality, number> = { normal: 0, urgent: 1, critical: 2 };

export function maxCriticality(a: BloodHeroCriticality, b: BloodHeroCriticality): BloodHeroCriticality {
  return RANK[a] >= RANK[b] ? a : b;
}

const CRITICAL_PATTERNS: RegExp[] = [
  /\bicu\b/,
  /\bccu\b/,
  /\bot\b/,
  /\bemergency\b/,
  /\baccident\b/,
  /\bbleeding\b/,
  /\bhemorrhag/,
  /\bhaemorrhag/,
  /\bsurgery\b/,
  /\boperation\b/,
  /\bcardiac\b/,
  /\bcaesarean\b|\bcesarean\b|\bc-section\b/,
  /\bdelivery\b/,
  /\bcritical\b/,
  /\blife[- ]threatening\b/,
  /জরুরি|জরুরী/,
  /দুর্ঘটনা/,
  /রক্তক্ষরণ/,
  /অপারেশন/,
  /আইসিইউ/,
  /সিজার/,
  /ডেলিভারি/,
  /ক্রিটিক্যাল/,
];

const URGENT_PATTERNS: RegExp[] = [
  /\burgent\b/,
  /\basap\b/,
  /\btonight\b/,
  /\btoday\b/,
  /\bdialysis\b/,
  /\bcancer\b/,
  /\bthalassemia\b|\bthalassaemia\b/,
  /\banemia\b|\banaemia\b/,
  /\bdengue\b/,
  /\bplatelet/,
  /আজ/,
  /ডায়ালাইসিস/,
  /ক্যান্সার/,
  /থ্যালাসেমিয়া/,
  /ডেঙ্গু/,
];

export type ClassifyInput = {
  condition: string | null | undefined;
  plannedDonationAt: string | Date;
  quantity: number;
  /** Injected for tests; defaults to now. */
  now?: Date;
};

/** Rule-based classification: keywords (EN/BN), hours until needed, and quantity. */
export function classifyCriticality(input: ClassifyInput): BloodHeroCriticality {
  const text = (input.condition ?? "").toLowerCase();
  let level: BloodHeroCriticality = "normal";

  if (CRITICAL_PATTERNS.some((p) => p.test(text))) level = "critical";
  else if (URGENT_PATTERNS.some((p) => p.test(text))) level = "urgent";

  const needed = new Date(input.plannedDonationAt).getTime();
  const now = (input.now ?? new Date()).getTime();
  if (Number.isFinite(needed)) {
    const hours = (needed - now) / 3_600_000;
    if (hours <= 6) level = maxCriticality(level, "critical");
    else if (hours <= 24) level = maxCriticality(level, "urgent");
  }

  if (input.quantity >= 4) level = maxCriticality(level, "urgent");
  return level;
}
