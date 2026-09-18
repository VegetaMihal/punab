import { notFound } from "next/navigation";
import { getForumBySlug } from "@/lib/repositories/org-forums-repository";
import { listActiveForumMembers } from "@/lib/repositories/org-memberships-repository";
import { getOrCreateCurrentReport, getReportWithActivities } from "@/lib/repositories/org-reports-repository";
import { listMonthlyPerformanceForReport, listRecommendationsForReport } from "@/lib/repositories/org-scoring-repository";
import { getPlanWithActivities } from "@/lib/repositories/org-plans-repository";
import { assertReportViewAccess } from "@/lib/auth/require-reporter";
import { CreateActivityForm } from "@/components/org/CreateActivityForm";
import { ActivityList } from "@/components/org/ActivityList";
import { ReportSubmitPanel } from "@/components/org/ReportSubmitPanel";
import { RecommendationsPanel } from "@/components/org/RecommendationsPanel";
import { PlannedActivityForm } from "@/components/org/PlannedActivityForm";
import { reportStatusLabel } from "@/lib/org/labels";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Shared by /portal/admin/forums/[slug]/report and /portal/reporter/forums/[slug]/report — same view, different access gate upstream. */
export async function ForumReportView({ slug }: { slug: string }) {
  const forum = await getForumBySlug(slug);
  if (!forum) notFound();

  // RBAC-003: enforce here, not just in the caller page — this view renders every member's
  // scores/recommendations/comments for the Forum.
  await assertReportViewAccess(forum.id);

  const reportShell = await getOrCreateCurrentReport(forum.id);
  const [report, activeMembers, performance, plan, recommendations] = await Promise.all([
    getReportWithActivities(reportShell.id),
    listActiveForumMembers(forum.id),
    listMonthlyPerformanceForReport(forum.id, reportShell.year, reportShell.month),
    getPlanWithActivities(reportShell.id),
    listRecommendationsForReport(reportShell.id),
  ]);
  if (!report) notFound();

  const editable = report.status === "draft" || report.status === "reopened";
  const recommendationByMember = new Map(recommendations.map((r) => [r.member_id, r]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          {forum.name} — {MONTH_NAMES[report.month - 1]} {report.year} report
        </h1>
        <p className="text-sm text-muted">
          {reportStatusLabel(report.status)} · Deadline {report.due_at.toLocaleDateString()}
          {report.submitted_at ? ` · Sent in on ${report.submitted_at.toLocaleDateString()}` : ""}
        </p>
        <p className="mt-2 max-w-xl text-sm text-muted">
          This page is your Forum&apos;s report for the month. List what happened, say how each person did, rate
          the team, jot down what you&apos;re planning next month, then submit.
        </p>
      </div>

      <ReportSubmitPanel reportId={report.id} status={report.status} />

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">1. What happened this month</h2>
        <p className="mb-2 text-xs text-muted">Every meeting, task, or event your Forum did — planned or not.</p>
        <ActivityList
          reportId={report.id}
          editable={editable}
          activities={report.activities.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            isPlanned: a.is_planned,
            status: a.status,
            plannedDate: a.planned_date ? a.planned_date.toISOString() : null,
            actualDate: a.actual_date ? a.actual_date.toISOString() : null,
            assignedMembers: a.assignments.map((asg) => ({
              assignmentId: asg.id,
              memberId: asg.member.id,
              memberName: asg.member.full_name,
              resultType: asg.result?.result_type ?? null,
            })),
          }))}
        />
      </section>

      {editable && (
        <section>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Add something that happened</h2>
          <p className="mb-2 text-xs text-muted">Give it a name, who was responsible, and how it went.</p>
          {activeMembers.length === 0 ? (
            <p className="text-sm text-muted">Add Forum members first on the Forum page before you can assign them to anything.</p>
          ) : (
            <CreateActivityForm
              reportId={report.id}
              members={activeMembers.map((m) => ({ id: m.member.id, full_name: m.member.full_name }))}
            />
          )}
        </section>
      )}

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">2. Rate each member (0-100)</h2>
        <p className="mb-2 text-xs text-muted">
          Your honest opinion of how well they showed up this month — leadership, effort, reliability. Below 50, tell
          us why.
        </p>
        <RecommendationsPanel
          reportId={report.id}
          editable={editable}
          members={activeMembers.map((m) => {
            const rec = recommendationByMember.get(m.member.id);
            return {
              memberId: m.member.id,
              memberName: m.member.full_name,
              score: rec?.score ?? null,
              comment: rec?.comment ?? null,
              needsApproval: rec?.needs_approval ?? false,
            };
          })}
        />
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
          3. What&apos;s planned for {plan ? `${MONTH_NAMES[plan.target_month - 1]} ${plan.target_year}` : "next month"}
        </h2>
        <p className="mb-2 text-xs text-muted">
          At least one planned item is required to submit this report — it&apos;ll show up automatically as next
          month&apos;s to-do list.
        </p>
        {plan && plan.planned_activities.length > 0 ? (
          <ul className="mb-3 divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {plan.planned_activities.map((pa) => (
              <li key={pa.id} className="px-4 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{pa.name}</span>
                  <span className="text-muted">{pa.approximate_date.toLocaleDateString()}</span>
                </div>
                {pa.assignments.length > 0 && (
                  <p className="text-xs text-muted">{pa.assignments.map((a) => a.member.full_name).join(", ")}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-muted">Nothing planned yet — add at least one thing before you can submit.</p>
        )}
        {editable && (
          <PlannedActivityForm
            reportId={report.id}
            members={activeMembers.map((m) => ({ id: m.member.id, full_name: m.member.full_name }))}
          />
        )}
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Scores so far</h2>
        <p className="mb-2 text-xs text-muted">Updates automatically as you grade activities and rate members.</p>
        {performance.length === 0 ? (
          <p className="text-sm text-muted">Nothing scored yet — grade an activity or rate a member above to see numbers here.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-stone-200 dark:border-stone-800">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                  <th className="px-4 py-2 font-medium">Member</th>
                  <th className="px-4 py-2 font-medium">Activity score</th>
                  <th className="px-4 py-2 font-medium">Your rating</th>
                  <th className="px-4 py-2 font-medium">Final score</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p) => (
                  <tr key={p.id} className="border-b border-stone-100 last:border-0 dark:border-stone-900">
                    <td className="px-4 py-2">{p.member.full_name}</td>
                    <td className="px-4 py-2">{p.activity_average !== null ? p.activity_average.toFixed(0) : "No activities yet"}</td>
                    <td className="px-4 py-2">{p.recommendation_score ?? "Not rated yet"}</td>
                    <td className="px-4 py-2">{p.final_score !== null ? `${p.final_score.toFixed(0)} / 100` : "Still missing info"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
