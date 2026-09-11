import { prisma } from "@/lib/db/prisma";

/** PLAN-001: the plan row is created lazily, the first time a planned activity is added. */
export async function getOrCreatePlan(reportId: string, targetYear: number, targetMonth: number) {
  const existing = await prisma.orgMonthlyPlan.findUnique({ where: { source_report_id: reportId } });
  if (existing) return existing;
  return prisma.orgMonthlyPlan.create({
    data: { source_report_id: reportId, target_year: targetYear, target_month: targetMonth },
  });
}

export async function getPlanWithActivities(reportId: string) {
  const plan = await prisma.orgMonthlyPlan.findUnique({
    where: { source_report_id: reportId },
    include: {
      planned_activities: {
        include: { assignments: { include: { member: { select: { id: true, full_name: true } } } } },
        orderBy: { approximate_date: "asc" },
      },
    },
  });
  return plan;
}

export async function addPlannedActivity(input: {
  planId: string;
  name: string;
  approximateDate: Date;
  description: string | null;
  memberIds: string[];
}) {
  return prisma.orgPlannedActivity.create({
    data: {
      plan_id: input.planId,
      name: input.name,
      approximate_date: input.approximateDate,
      description: input.description,
      assignments: { create: input.memberIds.map((memberId) => ({ member_id: memberId })) },
    },
  });
}

/**
 * PLAN-002: copies every planned activity from the previous month's plan into the new month's
 * report as Activities (is_planned=true), so the Reporter never re-enters them by hand.
 */
export async function carryForwardPlanIntoReport(input: {
  previousReportId: string;
  newReportId: string;
  createdBy: string | null;
}): Promise<void> {
  const plan = await prisma.orgMonthlyPlan.findUnique({
    where: { source_report_id: input.previousReportId },
    include: { planned_activities: { include: { assignments: true } } },
  });
  if (!plan || plan.planned_activities.length === 0) return;

  for (const pa of plan.planned_activities) {
    const activity = await prisma.orgActivity.create({
      data: {
        monthly_report_id: input.newReportId,
        name: pa.name,
        description: pa.description,
        is_planned: true,
        planned_date: pa.approximate_date,
        status: "planned",
        source_planned_activity_id: pa.id,
        created_by: input.createdBy,
        updated_by: input.createdBy,
      },
    });
    if (pa.assignments.length > 0) {
      await prisma.orgActivityAssignment.createMany({
        data: pa.assignments.map((a) => ({ activity_id: activity.id, member_id: a.member_id })),
        skipDuplicates: true,
      });
    }
  }
}
