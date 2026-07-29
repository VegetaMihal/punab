import { listMonitoringSubmissions } from "@/lib/monitoring-form-sheet";
import { MONITORING_CATEGORY_LABEL, type MonitoringCategory } from "@/lib/monitoring-score";
import { MONITORING_PROGRAM_STATUS_LABEL, type MonitoringProgramStatus } from "@/lib/validations/monitoring-form";

export type MonitoringPublicSummary = {
  totalVerified: number;
  totalUniversities: number;
  byProgramStatus: { name: string; value: number }[];
  byCategory: { name: string; value: number }[];
  universities: { universityName: string; programStatus: string; category: string }[];
};

const EMPTY_SUMMARY: MonitoringPublicSummary = {
  totalVerified: 0,
  totalUniversities: 0,
  byProgramStatus: [],
  byCategory: [],
  universities: [],
};

export async function listVerifiedMonitoringSummary(): Promise<
  { ok: true; summary: MonitoringPublicSummary } | { ok: false; message: string }
> {
  const result = await listMonitoringSubmissions();
  if (!result.ok) {
    return result;
  }

  const verified = result.rows.filter((r) => r.status === "Verified");
  if (verified.length === 0) {
    return { ok: true, summary: EMPTY_SUMMARY };
  }

  const universitySet = new Set(verified.map((r) => r.universityName));

  const statusCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  for (const r of verified) {
    const statusLabel = MONITORING_PROGRAM_STATUS_LABEL[r.programStatus as MonitoringProgramStatus] ?? r.programStatus;
    statusCounts.set(statusLabel, (statusCounts.get(statusLabel) ?? 0) + 1);
    const categoryLabel = MONITORING_CATEGORY_LABEL[r.category as MonitoringCategory] ?? r.category;
    categoryCounts.set(categoryLabel, (categoryCounts.get(categoryLabel) ?? 0) + 1);
  }

  const summary: MonitoringPublicSummary = {
    totalVerified: verified.length,
    totalUniversities: universitySet.size,
    byProgramStatus: Array.from(statusCounts.entries()).map(([name, value]) => ({ name, value })),
    byCategory: Array.from(categoryCounts.entries()).map(([name, value]) => ({ name, value })),
    universities: verified.map((r) => ({
      universityName: r.universityName,
      programStatus: MONITORING_PROGRAM_STATUS_LABEL[r.programStatus as MonitoringProgramStatus] ?? r.programStatus,
      category: MONITORING_CATEGORY_LABEL[r.category as MonitoringCategory] ?? r.category,
    })),
  };

  return { ok: true, summary };
}
