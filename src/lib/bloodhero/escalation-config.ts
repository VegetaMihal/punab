import type { BloodHeroCriticality } from "@/lib/bloodhero/classify-criticality";

export type EscalationRule = {
  /** Minutes to wait after the previous round (or request creation) before the next round. */
  intervalMinutes: number;
  /** Follow-up rounds allowed after the initial batch. */
  maxRounds: number;
};

export const ESCALATION_CONFIG: Record<BloodHeroCriticality, EscalationRule> = {
  critical: { intervalMinutes: 10, maxRounds: 6 },
  urgent: { intervalMinutes: 30, maxRounds: 4 },
  normal: { intervalMinutes: 120, maxRounds: 3 },
};
