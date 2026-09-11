import { prisma } from "@/lib/db/prisma";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";

export const RESULT_TYPES = [
  "completed",
  "partial_obstacle",
  "absent_approved",
  "absent_unapproved",
  "cancelled",
] as const;
export type ResultType = (typeof RESULT_TYPES)[number];

type ScoreConfig = {
  scores: Record<Exclude<ResultType, "cancelled">, number>;
  activityWeight: number;
  recommendationWeight: number;
  lowRecommendationThreshold: number;
};

async function getScoreConfig(): Promise<ScoreConfig> {
  const s = await getSiteSettingsMap();
  return {
    scores: {
      completed: Number.parseInt(s["org.score.completed"], 10) || 100,
      partial_obstacle: Number.parseInt(s["org.score.partial_obstacle"], 10) || 90,
      absent_approved: Number.parseInt(s["org.score.absent_approved"], 10) || 80,
      absent_unapproved: Number.parseInt(s["org.score.absent_unapproved"], 10) || 0,
    },
    activityWeight: Number.parseFloat(s["org.activity_weight"]) || 0.75,
    recommendationWeight: Number.parseFloat(s["org.recommendation_weight"]) || 0.25,
    lowRecommendationThreshold: Number.parseInt(s["org.low_recommendation_comment_threshold"], 10) || 50,
  };
}

export type SetActivityResultResult = { ok: true } | { ok: false; reason: string };

/** ACT-001/ACT-003/BR-010: 100/90/80/0 mapping; "cancelled" stores score = NULL (N/A), never 0. */
export async function setActivityMemberResult(input: {
  assignmentId: string;
  resultType: ResultType;
  comment: string | null;
  evaluatedBy: string;
}): Promise<SetActivityResultResult> {
  const config = await getScoreConfig();
  const score = input.resultType === "cancelled" ? null : config.scores[input.resultType];

  const assignment = await prisma.orgActivityAssignment.findUniqueOrThrow({
    where: { id: input.assignmentId },
    include: { activity: { include: { report: true } } },
  });

  await prisma.orgActivityMemberResult.upsert({
    where: { assignment_id: input.assignmentId },
    create: {
      assignment_id: input.assignmentId,
      result_type: input.resultType,
      score,
      comment: input.comment,
      evaluated_by: input.evaluatedBy,
    },
    update: {
      result_type: input.resultType,
      score,
      comment: input.comment,
      evaluated_by: input.evaluatedBy,
      evaluated_at: new Date(),
    },
  });

  await recalcMonthlyPerformance({
    memberId: assignment.member_id,
    forumId: assignment.activity.report.forum_id,
    year: assignment.activity.report.year,
    month: assignment.activity.report.month,
  });

  await writeAuditLog({
    actorId: input.evaluatedBy,
    action: "activity_result_set",
    entityType: "org_activity_assignment",
    entityId: input.assignmentId,
    newValue: { resultType: input.resultType, score, comment: input.comment },
  });

  return { ok: true };
}

export type SetRecommendationResult = { ok: true } | { ok: false; reason: string };

/** PERF-001/PERF-002: 0-100 score; comment mandatory below the configurable low-score threshold. */
export async function setRecommendation(input: {
  reportId: string;
  memberId: string;
  score: number;
  comment: string | null;
  reporterId: string;
}): Promise<SetRecommendationResult> {
  const config = await getScoreConfig();
  if (input.score < config.lowRecommendationThreshold && !input.comment?.trim()) {
    return {
      ok: false,
      reason: `A comment is required for recommendation scores below ${config.lowRecommendationThreshold}.`,
    };
  }

  const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: input.reportId } });

  // PERF-003: if the reporter is scoring themselves, flag for approval by a higher officer.
  const needsApproval = input.reporterId === input.memberId;

  await prisma.orgMonthlyRecommendation.upsert({
    where: { report_id_member_id: { report_id: input.reportId, member_id: input.memberId } },
    create: {
      report_id: input.reportId,
      member_id: input.memberId,
      score: input.score,
      comment: input.comment,
      reporter_id: input.reporterId,
      needs_approval: needsApproval,
    },
    update: {
      score: input.score,
      comment: input.comment,
      reporter_id: input.reporterId,
      needs_approval: needsApproval,
    },
  });

  await recalcMonthlyPerformance({
    memberId: input.memberId,
    forumId: report.forum_id,
    year: report.year,
    month: report.month,
  });

  await writeAuditLog({
    actorId: input.reporterId,
    action: "recommendation_set",
    entityType: "org_monthly_recommendation",
    entityId: `${input.reportId}:${input.memberId}`,
    newValue: { score: input.score, comment: input.comment, needsApproval },
  });

  return { ok: true };
}

/** PERF-003: a higher officer clears a self-scored recommendation before it counts toward the final score. */
export async function approveRecommendation(input: { reportId: string; memberId: string; approvedBy: string }) {
  const rec = await prisma.orgMonthlyRecommendation.update({
    where: { report_id_member_id: { report_id: input.reportId, member_id: input.memberId } },
    data: { needs_approval: false, approved_by: input.approvedBy, approved_at: new Date() },
  });
  const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: input.reportId } });
  await recalcMonthlyPerformance({
    memberId: rec.member_id,
    forumId: report.forum_id,
    year: report.year,
    month: report.month,
  });

  await writeAuditLog({
    actorId: input.approvedBy,
    action: "recommendation_self_score_approved",
    entityType: "org_monthly_recommendation",
    entityId: `${input.reportId}:${input.memberId}`,
  });
}

/** BR-009/ACT-002: Activity Average only counts valid scored results the member was actually assigned. */
async function computeActivityAverage(input: {
  memberId: string;
  forumId: string;
  year: number;
  month: number;
}): Promise<number | null> {
  const results = await prisma.orgActivityMemberResult.findMany({
    where: {
      assignment: {
        member_id: input.memberId,
        assignment_status: "assigned",
        activity: { report: { forum_id: input.forumId, year: input.year, month: input.month } },
      },
      score: { not: null },
    },
    select: { score: true },
  });
  if (results.length === 0) return null;
  const sum = results.reduce((acc, r) => acc + (r.score ?? 0), 0);
  return sum / results.length;
}

/**
 * PERF-004/BR-011/BR-013/PERF-005/PERF-006: recomputes on the backend and persists — never trusts
 * a frontend-supplied value. No valid activities => Insufficient Activity Data (NULL), never 0.
 */
export async function recalcMonthlyPerformance(input: {
  memberId: string;
  forumId: string;
  year: number;
  month: number;
}): Promise<void> {
  const config = await getScoreConfig();
  const activityAverage = await computeActivityAverage(input);

  const report = await prisma.orgMonthlyReport.findUnique({
    where: { forum_id_year_month: { forum_id: input.forumId, year: input.year, month: input.month } },
  });
  const recommendation = report
    ? await prisma.orgMonthlyRecommendation.findUnique({
        where: { report_id_member_id: { report_id: report.id, member_id: input.memberId } },
      })
    : null;

  const recommendationScore =
    recommendation && !recommendation.needs_approval ? recommendation.score : null;

  const finalScore =
    activityAverage !== null && recommendationScore !== null
      ? activityAverage * config.activityWeight + recommendationScore * config.recommendationWeight
      : null;

  await prisma.orgMonthlyPerformanceScore.upsert({
    where: {
      member_id_forum_id_year_month: {
        member_id: input.memberId,
        forum_id: input.forumId,
        year: input.year,
        month: input.month,
      },
    },
    create: {
      member_id: input.memberId,
      forum_id: input.forumId,
      year: input.year,
      month: input.month,
      activity_average: activityAverage,
      recommendation_score: recommendationScore,
      final_score: finalScore,
    },
    update: {
      activity_average: activityAverage,
      recommendation_score: recommendationScore,
      final_score: finalScore,
    },
  });
}

export async function listRecommendationsForReport(reportId: string) {
  return prisma.orgMonthlyRecommendation.findMany({ where: { report_id: reportId } });
}

export async function listMonthlyPerformanceForReport(forumId: string, year: number, month: number) {
  return prisma.orgMonthlyPerformanceScore.findMany({
    where: { forum_id: forumId, year, month },
    include: { member: { select: { id: true, full_name: true } } },
  });
}

/** BR-012: Overall Performance = average of all valid (non-NULL) Monthly Performance Points. */
export async function computeOverallPerformance(memberId: string): Promise<number | null> {
  const rows = await prisma.orgMonthlyPerformanceScore.findMany({
    where: { member_id: memberId, final_score: { not: null } },
    select: { final_score: true },
  });
  if (rows.length === 0) return null;
  const sum = rows.reduce((acc, r) => acc + (r.final_score ?? 0), 0);
  return sum / rows.length;
}
