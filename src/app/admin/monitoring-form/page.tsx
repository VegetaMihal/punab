import Link from "next/link";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { listMonitoringSubmissions, type MonitoringSheetRow } from "@/lib/monitoring-form-sheet";

export const metadata = { title: "Monitoring form" };

const STATUS_BADGE: Record<string, string> = {
  New: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
  "Under Review": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Verified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Duplicate: "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300",
};

export default async function AdminMonitoringFormPage() {
  await assertAdminScope("monitoring_form");

  let rows: MonitoringSheetRow[] = [];
  let error: string | null = null;
  const result = await listMonitoringSubmissions();
  if (!result.ok) {
    error = result.message;
  } else {
    rows = result.rows;
  }

  const sorted = [...rows].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">July Monitoring Form</h1>
          <p className="mt-1 text-sm text-muted">Review campus monitoring reports and manage status.</p>
        </div>
        <a
          href="/api/admin/monitoring-form/export-xlsx"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          Export .xlsx
        </a>
      </div>
      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && sorted.length === 0 && (
          <EmptyState title="No submissions" description="No monitoring reports have been submitted yet." />
        )}
        {!error &&
          sorted.map((r) => (
            <Link
              key={r.referenceNumber}
              href={`/admin/monitoring-form/${r.referenceNumber}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-brand-red/40 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-50">{r.universityName}</p>
                <p className="text-xs text-muted">
                  {r.referenceNumber} · {new Date(r.submittedAt).toLocaleDateString("en-GB")} · Score {r.score}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status] ?? STATUS_BADGE.New}`}
              >
                {r.status || "New"}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}
