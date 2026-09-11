import { listAuditLogs } from "@/lib/repositories/org-audit-repository";

export const metadata = { title: "Activity log — Org Portal" };

const ACTION_LABELS: Record<string, string> = {
  forum_status_change: "Forum status changed",
  report_submit: "Report submitted",
  report_reopen: "Report reopened",
  reporter_assign: "Reporter assigned",
  reporter_revoke: "Reporter removed",
  forum_membership_add: "Member added to a Forum",
  activity_result_set: "Activity graded",
  recommendation_set: "Member rated",
  recommendation_self_score_approved: "Self-rating confirmed",
  campus_role_add: "Campus role added",
  campus_role_remove: "Campus role removed",
  promotion_application_submitted: "Promotion requested",
  promotion_application_approved: "Promotion approved",
  promotion_application_rejected: "Promotion turned down",
};

export default async function AuditLogPage() {
  const logs = await listAuditLogs(200);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Activity log</h1>
      <p className="mb-6 text-sm text-muted">A record of every important change made in the system, and who made it.</p>
      {logs.length === 0 ? (
        <p className="text-sm text-muted">Nothing recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-stone-200 dark:border-stone-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">What happened</th>
                <th className="px-4 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-stone-100 last:border-0 align-top dark:border-stone-900">
                  <td className="px-4 py-2 whitespace-nowrap text-muted">{l.created_at.toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium">{ACTION_LABELS[l.action] ?? l.action}</td>
                  <td className="px-4 py-2 text-xs text-muted">
                    {l.new_value ? JSON.stringify(l.new_value) : l.notes ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
