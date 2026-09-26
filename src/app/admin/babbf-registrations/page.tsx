import Link from "next/link";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { batchListBabbfRegistrations, type BabbfRegistrationRow } from "@/lib/babbf-registration-sheet";
import { BABBF_EVENT_TYPE_LABEL, BABBF_EVENT_TYPES } from "@/lib/validations/babbf-registration";

export const metadata = { title: "BABBF Championship 2026 registrations" };

const STATUS_BADGE: Record<string, string> = {
  New: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
  "Payment Pending": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Payment Failed": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Duplicate: "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300",
};

export default async function AdminBabbfRegistrationsPage() {
  await assertAdminScope("babbf_registrations");

  let rows: (BabbfRegistrationRow & { tabEventType: string })[] = [];
  let error: string | null = null;
  const result = await batchListBabbfRegistrations();
  if (!result.ok) {
    error = result.message;
  } else {
    for (const eventType of BABBF_EVENT_TYPES) {
      rows = rows.concat(result.rowsByEventType[eventType].map((r) => ({ ...r, tabEventType: eventType })));
    }
  }

  const sorted = [...rows].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            BABBF Championship 2026 Registrations
          </h1>
          <p className="mt-1 text-sm text-muted">Review participant registrations and payment status.</p>
        </div>
        <a
          href="/api/admin/babbf-registrations/export-xlsx"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          Export .xlsx
        </a>
      </div>
      {!error && (
        <div className="mt-4 flex gap-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-wide text-muted">Total registered</p>
            <p className="mt-0.5 text-2xl font-bold text-stone-900 dark:text-stone-50">{sorted.length}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-wide text-muted">Checked in</p>
            <p className="mt-0.5 text-2xl font-bold text-green-700 dark:text-green-400">
              {sorted.filter((r) => r.checkedInAt).length}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {sorted.length === 0 && !error && (
          <EmptyState title="No registrations" description="No participant registrations have been submitted yet." />
        )}
        {sorted.map((r) => (
          <Link
            key={`${r.tabEventType}-${r.referenceNumber}`}
            href={`/admin/babbf-registrations/${r.referenceNumber}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-brand-red/40 dark:border-stone-800 dark:bg-stone-900"
          >
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-50">{r.fullName}</p>
              <p className="text-xs text-muted">
                {r.referenceNumber} · {BABBF_EVENT_TYPE_LABEL[r.tabEventType as keyof typeof BABBF_EVENT_TYPE_LABEL]} ·{" "}
                {r.universityName} · {new Date(r.submittedAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <span className="flex items-center gap-2">
              {r.checkedInAt && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓ Checked in
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status] ?? STATUS_BADGE.New}`}>
                {r.status || "New"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
