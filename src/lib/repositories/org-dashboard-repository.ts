import { prisma } from "@/lib/db/prisma";
import { getOrgYearMonth } from "@/lib/org/org-clock";
import { computeFullForumEligibility } from "@/lib/repositories/org-forums-repository";

/** §14.1: Central Management Dashboard organization summary. */
export async function getCentralDashboardSummary() {
  const { year, month } = await getOrgYearMonth();

  const [forums, currentReports, avgAgg] = await Promise.all([
    prisma.orgForum.findMany({
      include: {
        memberships: { where: { is_active: true }, include: { designation: true } },
        monthly_reports: { where: { year, month } },
      },
    }),
    prisma.orgMonthlyReport.findMany({ where: { year, month } }),
    prisma.orgMonthlyPerformanceScore.aggregate({
      where: { year, month, final_score: { not: null } },
      _avg: { final_score: true },
    }),
  ]);

  const totalForums = forums.length;
  const incompleteCount = forums.filter((f) => f.status === "incomplete").length;
  const fullCount = forums.filter((f) => f.status === "full").length;

  const statusCounts = { draft: 0, submitted: 0, late_submitted: 0, reopened: 0, resubmitted: 0 };
  for (const r of currentReports) {
    if (r.status in statusCounts) statusCounts[r.status as keyof typeof statusCounts]++;
  }

  const forumsMissingReport = forums.filter((f) => f.monthly_reports.length === 0);

  const eligibleForFull: { id: string; name: string; slug: string }[] = [];
  for (const f of forums.filter((f) => f.status === "incomplete")) {
    const eligibility = await computeFullForumEligibility(f.id);
    if (eligibility.eligible) eligibleForFull.push({ id: f.id, name: f.name, slug: f.slug });
  }

  const vacancies = forums
    .filter((f) => f.status === "full")
    .map((f) => {
      const secretaryFilled = f.memberships.some((m) => m.designation.level_code === "forum_secretary");
      const convenorFilled = f.memberships.some((m) => m.designation.level_code === "forum_convenor");
      const moderatorPlusCount = f.memberships.filter((m) => m.designation.numeric_rank >= 3).length;
      return { id: f.id, name: f.name, slug: f.slug, secretaryFilled, convenorFilled, moderatorPlusCount };
    })
    .filter((f) => !f.secretaryFilled || !f.convenorFilled);

  return {
    year,
    month,
    totalForums,
    incompleteCount,
    fullCount,
    statusCounts,
    forumsMissingReport: forumsMissingReport.map((f) => ({ id: f.id, name: f.name, slug: f.slug })),
    eligibleForFull,
    vacancies,
    averageMemberPerformance: avgAgg._avg.final_score,
  };
}
