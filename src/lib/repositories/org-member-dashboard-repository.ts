import { prisma } from "@/lib/db/prisma";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** MEM-001: current designation(s), with next-level promotion eligibility per PROMO-001..003. */
export async function getMyForumMemberships(memberId: string) {
  const settings = await getSiteSettingsMap();
  const cycleMonths = Number.parseInt(settings["org.promotion_cycle_months"], 10) || 2;

  const memberships = await prisma.orgForumMembership.findMany({
    where: { member_id: memberId, is_active: true },
    include: {
      forum: { select: { id: true, name: true, slug: true } },
      designation: { include: { scheme: { include: { levels: { orderBy: { numeric_rank: "asc" } } } } } },
    },
  });

  return memberships.map((m) => {
    const monthsAtLevel =
      (Date.now() - m.start_date.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
    const nextLevel = m.designation.scheme.levels.find(
      (l) => l.numeric_rank === m.designation.numeric_rank + 1
    );
    return {
      forumId: m.forum.id,
      forumName: m.forum.name,
      forumSlug: m.forum.slug,
      designationLabel: m.designation.label,
      startDate: m.start_date,
      monthsAtLevel,
      nextLevelLabel: nextLevel?.label ?? null,
      eligibleToApply: nextLevel ? monthsAtLevel >= cycleMonths : false,
      cycleMonths,
    };
  });
}

/** MEM-001: month-by-month score history across every Forum this member has been scored in. */
export async function getMyPerformanceHistory(memberId: string) {
  const rows = await prisma.orgMonthlyPerformanceScore.findMany({
    where: { member_id: memberId },
    include: { forum: { select: { name: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    forumName: r.forum.name,
    label: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
    activityAverage: r.activity_average,
    recommendationScore: r.recommendation_score,
    finalScore: r.final_score,
  }));
}

/** MEM-001: activities where this member is currently assigned and the activity is still open. */
export async function getMyUpcomingActivities(memberId: string) {
  const assignments = await prisma.orgActivityAssignment.findMany({
    where: {
      member_id: memberId,
      assignment_status: "assigned",
      activity: { status: { in: ["planned", "rescheduled"] } },
    },
    include: { activity: { include: { report: { include: { forum: { select: { name: true } } } } } } },
    orderBy: { activity: { planned_date: "asc" } },
  });
  return assignments.map((a) => ({
    id: a.id,
    activityName: a.activity.name,
    forumName: a.activity.report.forum.name,
    plannedDate: a.activity.planned_date,
    status: a.activity.status,
  }));
}
