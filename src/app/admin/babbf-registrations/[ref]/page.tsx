import Link from "next/link";
import { notFound } from "next/navigation";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { BabbfStatusControls } from "@/components/admin/BabbfStatusControls";
import { BabbfCheckInControls } from "@/components/admin/BabbfCheckInControls";
import { findBabbfRegistrationByReference } from "@/lib/babbf-registration-sheet";
import { BABBF_COL, BABBF_SHEET_HEADER_ROW } from "@/lib/babbf-registration-google";

export const metadata = { title: "BABBF Championship 2026 registration" };

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm text-stone-900 dark:text-stone-50">{value}</dd>
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand-red first:mt-0">{children}</h2>
  );
}

export default async function AdminBabbfRegistrationDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  await assertAdminScope("babbf_registrations");
  const { ref } = await params;

  const result = await findBabbfRegistrationByReference(ref);
  if (!result.ok) {
    return <EmptyState title="Error" description={result.message} />;
  }
  if (!result.row) {
    notFound();
  }
  const r = result.row;
  const c = (key: keyof typeof BABBF_COL) => String(r.cells[BABBF_COL[key]] ?? "");
  const labelFor = (key: keyof typeof BABBF_COL) => BABBF_SHEET_HEADER_ROW[BABBF_COL[key]];

  const docLinks: { label: string; url: string }[] = [
    { label: "Participant photo", url: c("photoUrl") },
    { label: "Payment screenshot", url: c("paymentScreenshotUrl") },
  ].filter((d) => d.url);

  return (
    <div>
      <Link href="/admin/babbf-registrations" className="text-sm text-accent hover:underline">
        &larr; Back to list
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">{r.fullName}</h1>
      <p className="text-sm text-muted">
        {r.referenceNumber} · Submitted {new Date(r.submittedAt).toLocaleString("en-GB")}
      </p>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <BabbfStatusControls referenceNumber={r.referenceNumber} currentStatus={r.status || "New"} currentNote={r.reviewerNote} />
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <BabbfCheckInControls
          referenceNumber={r.referenceNumber}
          checkedInAt={c("checkedInAt")}
          checkedInVia={c("checkedInVia")}
        />
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <SectionHeading>Participant information</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("phone")} value={c("phone")} />
          <Field label={labelFor("email")} value={c("email")} />
          <Field label={labelFor("universityName")} value={c("universityName")} />
          <Field label={labelFor("department")} value={c("department")} />
          <Field label={labelFor("gender")} value={c("gender")} />
          <Field label={labelFor("eventType")} value={c("eventType")} />
          <Field label={labelFor("studentCategory")} value={c("studentCategory")} />
          <Field label={labelFor("studentIdOrNid")} value={c("studentIdOrNid")} />
          <Field label={labelFor("category")} value={c("category")} />
          <Field label={labelFor("bodybuildingClass")} value={c("bodybuildingClass")} />
          <Field label={labelFor("physiqueClass")} value={c("physiqueClass")} />
          <Field label={labelFor("denimJeansOptIn")} value={c("denimJeansOptIn") === "true" ? "Yes" : ""} />
          <Field label={labelFor("bloodGroup")} value={c("bloodGroup")} />
          <Field label={labelFor("rightHandConfirmed")} value={c("rightHandConfirmed")} />
          <Field label={labelFor("declarationAccepted")} value={c("declarationAccepted")} />
        </dl>

        <SectionHeading>Payment verification</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("amount")} value={c("amount")} />
          <Field label={labelFor("paymentMethod")} value={r.paymentMethod} />
          <Field label={labelFor("paymentSenderNumber")} value={c("paymentSenderNumber")} />
          <Field label={labelFor("transactionId")} value={r.transactionId} />
        </dl>
      </div>

      {docLinks.length > 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Documents</h2>
          <ul className="mt-2 space-y-1">
            {docLinks.map((d) => (
              <li key={d.label}>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                  {d.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
