import Link from "next/link";
import { notFound } from "next/navigation";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonitoringStatusControls } from "@/components/admin/MonitoringStatusControls";
import { findMonitoringSubmissionByReference } from "@/lib/monitoring-form-sheet";

export const metadata = { title: "Monitoring report" };

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm text-stone-900 dark:text-stone-50">{value}</dd>
    </div>
  );
}

export default async function AdminMonitoringFormDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  await assertAdminScope("monitoring_form");
  const { ref } = await params;

  const result = await findMonitoringSubmissionByReference(ref);
  if (!result.ok) {
    return <EmptyState title="Error" description={result.message} />;
  }
  if (!result.row) {
    notFound();
  }
  const r = result.row;

  const evidenceLinks = r.evidenceLinks
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div>
      <Link href="/admin/monitoring-form" className="text-sm text-accent hover:underline">
        &larr; Back to list
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">{r.universityName}</h1>
      <p className="text-sm text-muted">
        {r.referenceNumber} · Submitted {new Date(r.submittedAt).toLocaleString("en-GB")}
      </p>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <MonitoringStatusControls
          referenceNumber={r.referenceNumber}
          currentStatus={r.status || "New"}
          currentNote={r.reviewerNote}
        />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:grid-cols-2">
        <Field label="Connection" value={r.connection} />
        <Field label="Connection (other)" value={r.connectionOther} />
        <Field label="July 2026 status" value={r.programStatus} />
        <Field label="Observations" value={r.observations} />
        <Field label="Observations (other)" value={r.observationsOther} />
        <Field label="Admin/trustee supporters" value={r.hasAdminSupporters} />
        <Field label="Supporter name" value={r.supporterName} />
        <Field label="Supporter position" value={r.supporterPosition} />
        <Field label="Supporter reasons" value={r.supporterReasons} />
        <Field label="Supporter reasons (other)" value={r.supporterReasonsOther} />
        <Field label="Score" value={r.score} />
        <Field label="Category" value={r.category} />
        <Field label="Contact OK" value={r.contactOk} />
        <Field label="Contact details" value={r.contactDetails} />
        <Field label="Keep confidential" value={r.keepConfidential} />
        <div className="sm:col-span-2">
          <Field label="Description" value={r.description} />
        </div>
      </dl>

      {evidenceLinks.length > 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Evidence</h2>
          <ul className="mt-2 space-y-1">
            {evidenceLinks.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
