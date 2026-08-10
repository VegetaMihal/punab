import Link from "next/link";
import { notFound } from "next/navigation";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { MunStatusControls } from "@/components/admin/MunStatusControls";
import { findMunApplicationByReference } from "@/lib/mun-form-sheet";
import { MUN_COL, MUN_SHEET_HEADER_ROW } from "@/lib/mun-form-google";

export const metadata = { title: "IMUN 2026 application" };

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

export default async function AdminMunFormDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  await assertAdminScope("mun_form");
  const { ref } = await params;

  const result = await findMunApplicationByReference(ref);
  if (!result.ok) {
    return <EmptyState title="Error" description={result.message} />;
  }
  if (!result.row) {
    notFound();
  }
  const r = result.row;
  const c = (key: keyof typeof MUN_COL) => String(r.cells[MUN_COL[key]] ?? "");
  const labelFor = (key: keyof typeof MUN_COL) => MUN_SHEET_HEADER_ROW[MUN_COL[key]];

  const docLinks: { label: string; url: string }[] = [
    { label: "Photograph", url: c("photoUrl") },
    { label: "Student ID document", url: c("studentIdDocUrl") },
    { label: "National ID / Passport", url: c("nationalIdOrPassportUrl") },
    { label: "Passport copy", url: c("passportCopyUrl") },
    { label: "Payment proof", url: c("paymentProofUrl") },
  ].filter((d) => d.url);

  return (
    <div>
      <Link href="/admin/mun-form" className="text-sm text-accent hover:underline">
        &larr; Back to list
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">{r.fullName}</h1>
      <p className="text-sm text-muted">
        {r.referenceNumber} · Submitted {new Date(r.submittedAt).toLocaleString("en-GB")}
      </p>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <MunStatusControls referenceNumber={r.referenceNumber} currentStatus={r.status || "New"} currentNote={r.reviewerNote} />
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <SectionHeading>Personal information</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("certificateName")} value={c("certificateName")} />
          <Field label={labelFor("dob")} value={c("dob")} />
          <Field label={labelFor("gender")} value={c("gender")} />
          <Field label={labelFor("nationality")} value={c("nationality")} />
          <Field label={labelFor("idNumber")} value={c("idNumber")} />
          <Field label={labelFor("mobile")} value={c("mobile")} />
          <Field label={labelFor("whatsapp")} value={c("whatsapp")} />
          <Field label={labelFor("email")} value={c("email")} />
          <Field label={labelFor("facebookLink")} value={c("facebookLink")} />
          <Field label={labelFor("presentAddress")} value={c("presentAddress")} />
          <Field label={labelFor("permanentAddress")} value={c("permanentAddress")} />
        </dl>

        <SectionHeading>Academic information</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("institutionName")} value={c("institutionName")} />
          <Field label={labelFor("department")} value={c("department")} />
          <Field label={labelFor("currentYear")} value={c("currentYear")} />
          <Field label={labelFor("studentId")} value={c("studentId")} />
          <Field label={labelFor("educationLevel")} value={c("educationLevel")} />
          <Field label={labelFor("educationLevelOther")} value={c("educationLevelOther")} />
        </dl>

        <SectionHeading>Committee and country preference</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("firstCommittee")} value={c("firstCommittee")} />
          <Field label={labelFor("secondCommittee")} value={c("secondCommittee")} />
          <Field label={labelFor("thirdCommittee")} value={c("thirdCommittee")} />
          <Field label={labelFor("firstCountry")} value={c("firstCountry")} />
          <Field label={labelFor("secondCountry")} value={c("secondCountry")} />
          <Field label={labelFor("thirdCountry")} value={c("thirdCountry")} />
        </dl>

        <SectionHeading>MUN experience</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("hasPriorMun")} value={c("hasPriorMun")} />
          <Field label={labelFor("totalConferences")} value={c("totalConferences")} />
          <Field label={labelFor("wasLeadership")} value={c("wasLeadership")} />
          <div className="sm:col-span-2">
            <Field label={labelFor("previousExperience")} value={c("previousExperience")} />
          </div>
          <div className="sm:col-span-2">
            <Field label={labelFor("leadershipDetails")} value={c("leadershipDetails")} />
          </div>
        </dl>

        <SectionHeading>Motivation and skills</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4">
          <Field label={labelFor("whyParticipate")} value={c("whyParticipate")} />
          <Field label={labelFor("whatToLearn")} value={c("whatToLearn")} />
          <Field label={labelFor("whySelected")} value={c("whySelected")} />
          <Field label={labelFor("relevantSkills")} value={c("relevantSkills")} />
          <Field label={labelFor("areasOfInterest")} value={c("areasOfInterest")} />
          <Field label={labelFor("areasOfInterestOther")} value={c("areasOfInterestOther")} />
        </dl>

        <SectionHeading>Emergency contact</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("emergencyContactName")} value={c("emergencyContactName")} />
          <Field label={labelFor("emergencyRelationship")} value={c("emergencyRelationship")} />
          <Field label={labelFor("emergencyMobile")} value={c("emergencyMobile")} />
          <Field label={labelFor("emergencyAltMobile")} value={c("emergencyAltMobile")} />
          <div className="sm:col-span-2">
            <Field label={labelFor("emergencyAddress")} value={c("emergencyAddress")} />
          </div>
        </dl>

        <SectionHeading>Special requirements</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("dietaryRestrictions")} value={c("dietaryRestrictions")} />
          <Field label={labelFor("dietaryDetails")} value={c("dietaryDetails")} />
          <Field label={labelFor("accessibilityNeeds")} value={c("accessibilityNeeds")} />
          <Field label={labelFor("accessibilityDetails")} value={c("accessibilityDetails")} />
          <Field label={labelFor("medicalRequirements")} value={c("medicalRequirements")} />
          <Field label={labelFor("medicalDetails")} value={c("medicalDetails")} />
          <Field label={labelFor("foodPreference")} value={c("foodPreference")} />
        </dl>

        <SectionHeading>Accommodation and travel</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("needsAccommodation")} value={c("needsAccommodation")} />
          <Field label={labelFor("fromOutsideDhaka")} value={c("fromOutsideDhaka")} />
          <Field label={labelFor("departureDistrict")} value={c("departureDistrict")} />
          <Field label={labelFor("arrivalDateTime")} value={c("arrivalDateTime")} />
          <Field label={labelFor("departureDateTime")} value={c("departureDateTime")} />
          <div className="sm:col-span-2">
            <Field label={labelFor("travelNotes")} value={c("travelNotes")} />
          </div>
        </dl>

        <SectionHeading>Payment verification</SectionHeading>
        <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={labelFor("amount")} value={c("amount")} />
          <Field label={labelFor("paymentMethod")} value={r.paymentMethod} />
          <Field label={labelFor("amountPaid")} value={r.amountPaid} />
          <Field label={labelFor("paymentDate")} value={r.paymentDate} />
          <Field label={labelFor("transactionId")} value={r.transactionId} />
          <Field label={labelFor("paymentSenderInfo")} value={r.paymentSenderInfo} />
          <Field label={labelFor("paymentAccountHolderName")} value={r.paymentAccountHolderName} />
          <Field label={labelFor("paymentBankName")} value={r.paymentBankName} />
          <Field label={labelFor("paymentDepositSlipRef")} value={r.paymentDepositSlipRef} />
          <div className="sm:col-span-2">
            <Field label={labelFor("paymentAdditionalInfo")} value={r.paymentAdditionalInfo} />
          </div>
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
