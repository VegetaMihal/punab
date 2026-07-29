import type { MonitoringObservation } from "@/lib/validations/monitoring-form";

const OBSERVATION_POINTS: Partial<Record<MonitoringObservation, number>> = {
  program_held: 3,
  official_post: 1,
  martyrs_honoured: 2,
  permission_refused: -2,
  students_pressured: -3,
};

export const MONITORING_CATEGORIES = [
  "strong_support",
  "partial_support",
  "no_visible_action",
  "serious_concern",
  "under_verification",
] as const;
export type MonitoringCategory = (typeof MONITORING_CATEGORIES)[number];

export const MONITORING_CATEGORY_LABEL: Record<MonitoringCategory, string> = {
  strong_support: "Strong support",
  partial_support: "Partial support",
  no_visible_action: "No visible action",
  serious_concern: "Serious concern",
  under_verification: "Under verification",
};

export function computeMonitoringScore(observations: readonly string[]): number {
  return observations.reduce((sum, o) => sum + (OBSERVATION_POINTS[o as MonitoringObservation] ?? 0), 0);
}

export function categoryFromScore(score: number): MonitoringCategory {
  if (score >= 5) return "strong_support";
  if (score >= 2) return "partial_support";
  if (score >= 0) return "no_visible_action";
  return "serious_concern";
}
