import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { computeOverallPerformance } from "@/lib/repositories/org-scoring-repository";
import { listMyReporterForums } from "@/lib/repositories/org-reporters-repository";
import { listMyApplications } from "@/lib/repositories/org-promotions-repository";
import {
  getMyForumMemberships,
  getMyPerformanceHistory,
  getMyUpcomingActivities,
} from "@/lib/repositories/org-member-dashboard-repository";
import { ApplyForPromotionForm } from "@/components/org/ApplyForPromotionForm";
import { promotionStatusLabel } from "@/lib/org/labels";

export const metadata = { title: "My Forum Activity" };

export default async function MemberOrgDashboardPage() {
  const { user } = await getSessionProfile();
  if (!user) return null;

  const [memberships, history, upcoming, overall, reporterForums, myApplications] = await Promise.all([
    getMyForumMemberships(user.id),
    getMyPerformanceHistory(user.id),
    getMyUpcomingActivities(user.id),
    computeOverallPerformance(user.id),
    listMyReporterForums(user.id),
    listMyApplications(user.id),
  ]);
  const pendingApplicationForumIds = new Set(
    myApplications.filter((a) => a.status === "pending").map((a) => a.forum_id)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">My Forum Activity</h1>
        <p className="mt-1 text-sm text-muted">
          Your score so far: <span className="font-medium text-stone-900 dark:text-stone-100">{overall !== null ? `${overall.toFixed(0)} out of 100` : "Not scored yet"}</span>
        </p>
        {reporterForums.length > 0 && (
          <Link href="/portal/reporter" className="mt-2 inline-block text-sm text-brand-green hover:underline">
            You&apos;re a Reporter for a Forum — go fill in your report →
          </Link>
        )}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Where you stand</h2>
        {memberships.length === 0 ? (
          <p className="text-sm text-muted">You&apos;re not part of any Forum yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {memberships.map((m) => (
              <li key={m.forumId} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{m.forumName} — {m.designationLabel}</span>
                  <span className="text-muted">since {m.startDate.toLocaleDateString()}</span>
                </div>
                {m.nextLevelLabel && (
                  <div className="mt-1 text-xs text-muted">
                    <p>
                      Next step up: <span className="font-medium">{m.nextLevelLabel}</span> · {m.eligibleToApply
                        ? "You can apply now"
                        : `${Math.max(m.cycleMonths - m.monthsAtLevel, 0).toFixed(1)} more month(s) to go`}
                    </p>
                    {m.eligibleToApply && pendingApplicationForumIds.has(m.forumId) && (
                      <p className="mt-1 text-amber-700 dark:text-amber-400">Your application is waiting for a decision.</p>
                    )}
                    {m.eligibleToApply && !pendingApplicationForumIds.has(m.forumId) && (
                      <ApplyForPromotionForm forumId={m.forumId} />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">What&apos;s coming up</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">Nothing on your plate right now.</p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                <span>{a.activityName} <span className="text-muted">({a.forumName})</span></span>
                <span className="text-muted">{a.plannedDate ? a.plannedDate.toLocaleDateString() : "date not set"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Your scores, month by month</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted">Nothing scored yet — check back after your Forum submits a monthly report.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-stone-200 dark:border-stone-800">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                  <th className="px-4 py-2 font-medium">Month</th>
                  <th className="px-4 py-2 font-medium">Forum</th>
                  <th className="px-4 py-2 font-medium">Activity score</th>
                  <th className="px-4 py-2 font-medium">Reporter&apos;s rating</th>
                  <th className="px-4 py-2 font-medium">Final</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-stone-100 last:border-0 dark:border-stone-900">
                    <td className="px-4 py-2">{h.label}</td>
                    <td className="px-4 py-2 text-muted">{h.forumName}</td>
                    <td className="px-4 py-2">{h.activityAverage !== null ? h.activityAverage.toFixed(0) : "No activities"}</td>
                    <td className="px-4 py-2">{h.recommendationScore ?? "Not rated"}</td>
                    <td className="px-4 py-2">{h.finalScore !== null ? h.finalScore.toFixed(0) : "Incomplete"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">My promotion requests</h2>
        {myApplications.length === 0 ? (
          <p className="text-sm text-muted">You haven&apos;t applied for a promotion yet — you&apos;ll see an &quot;Apply&quot; button above once you&apos;re eligible.</p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {myApplications.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                <span>{a.forum.name}</span>
                <span className="text-muted">{promotionStatusLabel(a.status)} · {a.applied_at.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">
          Appointment letters and Forum transfers aren&apos;t available yet — contact Central Forum Management directly.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Notifications</h2>
        <p className="text-sm text-muted">Nothing here yet — check back later.</p>
      </section>

      <Link href="/dashboard" className="inline-block text-sm text-brand-green hover:underline">
        ← Back to PUNAB dashboard
      </Link>
    </div>
  );
}
