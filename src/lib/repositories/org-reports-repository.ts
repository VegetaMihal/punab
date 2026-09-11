import { prisma } from "@/lib/db/prisma";
import { getOrgYearMonth, getPreviousYearMonth, getReportDueAt } from "@/lib/org/org-clock";
import { getActivePrimaryReporterId } from "@/lib/repositories/org-reporters-repository";
import { carryForwardPlanIntoReport } from "@/lib/repositories/org-plans-repository";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";

/** REPORT-001/REPORT-002: one report per Forum/year/month, created as Draft on first touch. */
export async function getOrCreateCurrentReport(forumId: string) {
  const { year, month } = await getOrgYearMonth();
  const existing = await prisma.orgMonthlyReport.findUnique({
    where: { forum_id_year_month: { forum_id: forumId, year, month } },
  });
  if (existing) return existing;

  const dueAt = await getReportDueAt(year, month);
  const primaryReporterId = await getActivePrimaryReporterId(forumId);
  const created = await prisma.orgMonthlyReport.create({
    data: { forum_id: forumId, year, month, due_at: dueAt, primary_reporter_id: primaryReporterId },
  });

  // PLAN-002: pull in whatever the previous month's report planned for this month.
  const prev = getPreviousYearMonth(year, month);
  const previousReport = await prisma.orgMonthlyReport.findUnique({
    where: { forum_id_year_month: { forum_id: forumId, year: prev.year, month: prev.month } },
  });
  if (previousReport) {
    await carryForwardPlanIntoReport({
      previousReportId: previousReport.id,
      newReportId: created.id,
      createdBy: primaryReporterId,
    });
  }

  return created;
}

export async function getReportWithActivities(reportId: string) {
  return prisma.orgMonthlyReport.findUnique({
    where: { id: reportId },
    include: {
      activities: {
        include: {
          assignments: {
            where: { assignment_status: "assigned" },
            include: { member: { select: { id: true, full_name: true } }, result: true },
          },
        },
        orderBy: { created_at: "asc" },
      },
    },
  });
}

export type CreateActivityInput = {
  reportId: string;
  name: string;
  description: string | null;
  isPlanned: boolean;
  plannedDate: Date | null;
  actualDate: Date | null;
  status: string;
  createdBy: string;
};

/** REPORT-006/REPORT-007: Reporter editing is only allowed while the report is Draft or Reopened. */
async function assertReportEditable(reportId: string): Promise<void> {
  const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: reportId } });
  if (report.status !== "draft" && report.status !== "reopened") {
    throw new Error("This report is locked and cannot be edited.");
  }
}

export async function createActivity(input: CreateActivityInput) {
  await assertReportEditable(input.reportId);
  return prisma.orgActivity.create({
    data: {
      monthly_report_id: input.reportId,
      name: input.name,
      description: input.description,
      is_planned: input.isPlanned,
      planned_date: input.plannedDate,
      actual_date: input.actualDate,
      status: input.status,
      created_by: input.createdBy,
      updated_by: input.createdBy,
    },
  });
}

export async function setActivityStatus(input: {
  activityId: string;
  reportId: string;
  status: string;
  actualDate: Date | null;
  updatedBy: string;
}) {
  await assertReportEditable(input.reportId);
  return prisma.orgActivity.update({
    where: { id: input.activityId },
    data: { status: input.status, actual_date: input.actualDate, updated_by: input.updatedBy },
  });
}

/** REPORT-006: "Select All" still writes one row per member — never a single all-members flag. */
export async function assignMembersToActivity(input: {
  activityId: string;
  reportId: string;
  memberIds: string[];
  assignedBy: string;
}) {
  await assertReportEditable(input.reportId);
  await prisma.orgActivityAssignment.createMany({
    data: input.memberIds.map((memberId) => ({
      activity_id: input.activityId,
      member_id: memberId,
      assigned_by: input.assignedBy,
    })),
    skipDuplicates: true,
  });
}

/** ACT-003: cancelled assignments are kept (never deleted) and excluded from scoring by status, not removal. */
export async function cancelActivityAssignment(assignmentId: string, reportId: string) {
  await assertReportEditable(reportId);
  await prisma.orgActivityAssignment.update({
    where: { id: assignmentId },
    data: { assignment_status: "cancelled" },
  });
}

/**
 * VAL-001..004: everything that must be true before a report can be submitted, phrased so the
 * UI can show it verbatim (VAL-004). Never partial — either all pass or submission is blocked.
 */
export async function validateReportForSubmission(reportId: string): Promise<string[]> {
  const issues: string[] = [];
  const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: reportId } });

  const [closedWithoutResult, activeMemberCount, recommendationCount, plan, settings] = await Promise.all([
    prisma.orgActivityAssignment.count({
      where: {
        assignment_status: "assigned",
        result: null,
        activity: {
          monthly_report_id: reportId,
          status: { in: ["completed", "partially_completed", "not_completed", "rescheduled"] },
        },
      },
    }),
    prisma.orgForumMembership.count({
      where: { is_active: true, forum_id: report.forum_id },
    }),
    prisma.orgMonthlyRecommendation.count({ where: { report_id: reportId } }),
    prisma.orgMonthlyPlan.findUnique({
      where: { source_report_id: reportId },
      include: { _count: { select: { planned_activities: true } } },
    }),
    prisma.siteSetting.findUnique({ where: { key: "org.allow_no_activities_planned" } }),
  ]);

  if (closedWithoutResult > 0) {
    issues.push(`${closedWithoutResult} member evaluation(s) incomplete on closed activities.`);
  }

  const missingRecommendations = activeMemberCount - recommendationCount;
  if (missingRecommendations > 0) {
    issues.push(`${missingRecommendations} recommendation score(s) missing.`);
  }

  const allowNoPlan = settings?.value === "true";
  const plannedCount = plan?._count.planned_activities ?? 0;
  if (!allowNoPlan && plannedCount === 0) {
    issues.push("Next-month plan is incomplete — add at least one planned activity.");
  }

  return issues;
}

/** REPORT-003/004/005: locks the report; late if past due_at. Reopened reports become "resubmitted" instead. */
export async function submitReport(reportId: string, submittedBy: string | null): Promise<void> {
  const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: reportId } });
  if (report.status !== "draft" && report.status !== "reopened") {
    throw new Error("This report is already submitted.");
  }

  const issues = await validateReportForSubmission(reportId);
  if (issues.length > 0) {
    throw new Error(issues.join("; "));
  }

  const now = new Date();
  const wasReopened = report.status === "reopened";
  const late = now.getTime() > report.due_at.getTime();
  const newStatus = wasReopened ? "resubmitted" : late ? "late_submitted" : "submitted";
  await prisma.orgMonthlyReport.update({
    where: { id: reportId },
    data: { status: newStatus, submitted_at: now },
  });

  await writeAuditLog({
    actorId: submittedBy,
    action: "report_submit",
    entityType: "org_monthly_report",
    entityId: reportId,
    oldValue: { status: report.status },
    newValue: { status: newStatus },
  });
}

/** REPORT-005/BR-015: only Central Management can reopen, and a reason is mandatory. */
export async function reopenReport(input: { reportId: string; reopenedBy: string; reason: string }): Promise<void> {
  const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: input.reportId } });
  if (report.status !== "submitted" && report.status !== "late_submitted" && report.status !== "resubmitted") {
    throw new Error("Only a submitted report can be reopened.");
  }
  await prisma.orgMonthlyReport.update({
    where: { id: input.reportId },
    data: {
      status: "reopened",
      reopened_by: input.reopenedBy,
      reopened_at: new Date(),
      reopen_reason: input.reason,
    },
  });

  await writeAuditLog({
    actorId: input.reopenedBy,
    action: "report_reopen",
    entityType: "org_monthly_report",
    entityId: input.reportId,
    oldValue: { status: report.status },
    newValue: { status: "reopened", reason: input.reason },
  });
}
