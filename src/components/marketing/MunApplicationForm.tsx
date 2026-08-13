"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { submitMunForm, type SubmitMunFormState } from "@/actions/mun-form";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  MUN_AREAS_OF_INTEREST,
  MUN_AREA_OF_INTEREST_LABEL,
  MUN_COMMITTEES,
  MUN_EDUCATION_LEVELS,
  MUN_EDUCATION_LEVEL_LABEL,
  MUN_FOOD_PREFERENCES,
  MUN_FOOD_PREFERENCE_LABEL,
  MUN_GENDERS,
  MUN_GENDER_LABEL,
  MUN_PAYMENT_METHODS,
  MUN_PAYMENT_METHOD_LABEL,
  MUN_REGISTRATION_FEE_BDT,
  MUN_YES_NO,
} from "@/lib/validations/mun-form";

const initial: SubmitMunFormState = {};

const req = (
  <span className="text-[color:var(--color-error)]" aria-hidden>
    *
  </span>
);

function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-small leading-relaxed text-[color:var(--color-text-muted)]">{children}</p>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-small font-medium text-[color:var(--color-error)]" role="alert">
      {message}
    </p>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <Reveal>
      <section className="group space-y-5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] motion-safe:transition-shadow motion-safe:duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)] sm:p-8">
        {children}
      </section>
    </Reveal>
  );
}

function SectionHeading({ letter, children }: { letter?: string; children: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--color-border)] pb-4">
      {letter && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-small font-bold text-white motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] group-hover:scale-110">
          {letter}
        </span>
      )}
      <h2 className="text-h4 font-semibold text-[color:var(--color-text)]">{children}</h2>
    </div>
  );
}

function TextField({
  name,
  label,
  required,
  defaultValue,
  error,
  type = "text",
  placeholder,
  readOnly,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="ds-label">
        {label} {required && req}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`ds-input ${readOnly ? "cursor-not-allowed bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]" : ""}`}
        defaultValue={defaultValue}
        aria-describedby={error ? `${name}-err` : undefined}
      />
      <FieldError id={`${name}-err`} message={error} />
    </div>
  );
}

function TextAreaField({
  name,
  label,
  required,
  defaultValue,
  error,
  rows = 3,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="ds-label">
        {label} {required && req}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        className="ds-textarea"
        defaultValue={defaultValue}
        aria-describedby={error ? `${name}-err` : undefined}
      />
      <FieldError id={`${name}-err`} message={error} />
    </div>
  );
}

function YesNoField({
  name,
  label,
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="ds-label">
        {label} {req}
      </legend>
      <div className="mt-2 flex gap-2">
        {MUN_YES_NO.map((a) => (
          <label
            key={a}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-small font-medium capitalize transition-colors ${
              value === a
                ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white"
                : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-brand)]"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={a}
              required
              checked={value === a}
              onChange={() => onChange(a)}
              className="sr-only"
            />
            {a}
          </label>
        ))}
      </div>
      <FieldError id={`${name}-err`} message={error} />
    </fieldset>
  );
}

function DocumentField({
  name,
  label,
  required,
  error,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="ds-label">
        {label} {required && req}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept="image/*,application/pdf"
        className="ds-input cursor-pointer file:mr-3 file:cursor-pointer file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-brand)] file:px-3 file:py-1.5 file:text-small file:font-semibold file:text-white hover:file:opacity-90"
        aria-describedby={error ? `${name}-err` : undefined}
      />
      <FieldError id={`${name}-err`} message={error} />
    </div>
  );
}

export function MunApplicationForm() {
  const [state, formAction, pending] = useActionState(submitMunForm, initial);
  const fv = state?.fieldValues ?? {};
  const fe = state?.fieldErrors ?? {};

  const [educationLevel, setEducationLevel] = useState(fv.educationLevel ?? "");
  const [hasPriorMun, setHasPriorMun] = useState(fv.hasPriorMun ?? "");
  const [wasLeadership, setWasLeadership] = useState(fv.wasLeadership ?? "");
  const [dietaryRestrictions, setDietaryRestrictions] = useState(fv.dietaryRestrictions ?? "");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(fv.accessibilityNeeds ?? "");
  const [medicalRequirements, setMedicalRequirements] = useState(fv.medicalRequirements ?? "");
  const [needsAccommodation, setNeedsAccommodation] = useState(fv.needsAccommodation ?? "");
  const [fromOutsideDhaka, setFromOutsideDhaka] = useState(fv.fromOutsideDhaka ?? "");
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState(fv.paymentMethod ?? "");

  useEffect(() => {
    if (state?.success) {
      toast.success("Application submitted");
    }
  }, [state?.success]);

  if (state?.success) {
    return (
      <div className="mx-auto max-w-xl motion-safe:animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)] rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-2xl text-white motion-safe:animate-[popIn_500ms_cubic-bezier(0.34,1.56,0.64,1)_150ms_both]">
          ✓
        </span>
        <p className="mt-4 text-h4 font-semibold text-[color:var(--color-text)]">Application submitted</p>
        <p className="mt-3 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          Reference: <strong className="text-[color:var(--color-text)]">{state.referenceNumber}</strong>
          <br />
          Your registration is <strong>pending</strong> until the PUNAB IMUN Secretariat manually verifies your
          payment. You will be notified once your registration is confirmed.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6">
      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <input type="hidden" name="stagedDocumentUrls" value={JSON.stringify(state?.stagedDocumentUrls ?? {})} />

      <Card>
        <SectionHeading letter="A">Personal Information</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="fullName" label="Full Name" required defaultValue={fv.fullName} error={fe.fullName} />
          <TextField
            name="certificateName"
            label="Name as it should appear on the certificate"
            required
            defaultValue={fv.certificateName}
            error={fe.certificateName}
          />
          <TextField name="dob" label="Date of Birth" type="date" required defaultValue={fv.dob} error={fe.dob} />
          <div>
            <label htmlFor="gender" className="ds-label">
              Gender {req}
            </label>
            <select id="gender" name="gender" required className="ds-input" defaultValue={fv.gender ?? ""}>
              <option value="">Select</option>
              {MUN_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {MUN_GENDER_LABEL[g]}
                </option>
              ))}
            </select>
            <FieldError id="gender-err" message={fe.gender} />
          </div>
          <TextField name="nationality" label="Nationality" required defaultValue={fv.nationality} error={fe.nationality} />
          <TextField
            name="idNumber"
            label="National ID / Birth Registration / Passport Number"
            defaultValue={fv.idNumber}
            error={fe.idNumber}
          />
          <TextField name="mobile" label="Mobile Number" required defaultValue={fv.mobile} error={fe.mobile} />
          <TextField name="whatsapp" label="WhatsApp Number" required defaultValue={fv.whatsapp} error={fe.whatsapp} />
          <TextField name="email" label="Email Address" type="email" required defaultValue={fv.email} error={fe.email} />
          <TextField name="facebookLink" label="Facebook Profile Link" defaultValue={fv.facebookLink} error={fe.facebookLink} />
        </div>
        <TextAreaField name="presentAddress" label="Present Address" required defaultValue={fv.presentAddress} error={fe.presentAddress} />
        <TextAreaField name="permanentAddress" label="Permanent Address" required defaultValue={fv.permanentAddress} error={fe.permanentAddress} />
      </Card>

      <Card>
        <SectionHeading letter="B">Academic Information</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="institutionName" label="Name of Institution" required defaultValue={fv.institutionName} error={fe.institutionName} />
          <TextField name="department" label="Department / Programme" required defaultValue={fv.department} error={fe.department} />
          <TextField name="currentYear" label="Current Semester / Year" required defaultValue={fv.currentYear} error={fe.currentYear} />
          <TextField name="studentId" label="Student ID" required defaultValue={fv.studentId} error={fe.studentId} />
          <div>
            <label htmlFor="educationLevel" className="ds-label">
              Educational Level {req}
            </label>
            <select
              id="educationLevel"
              name="educationLevel"
              required
              className="ds-input"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <option value="" disabled>
                Select
              </option>
              {MUN_EDUCATION_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {MUN_EDUCATION_LEVEL_LABEL[l]}
                </option>
              ))}
            </select>
            <FieldError id="educationLevel-err" message={fe.educationLevel} />
          </div>
          {educationLevel === "other" && (
            <TextField name="educationLevelOther" label="Describe education level" defaultValue={fv.educationLevelOther} error={fe.educationLevelOther} />
          )}
        </div>
      </Card>

      <Card>
        <SectionHeading letter="C">Committee and Country Preference</SectionHeading>
        <Hint>Final allocation is decided by the Secretariat based on availability and experience.</Hint>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["firstCommittee", "secondCommittee", "thirdCommittee"] as const).map((name, i) => (
            <div key={name}>
              <label htmlFor={name} className="ds-label">
                {["First", "Second", "Third"][i]} Committee Preference {req}
              </label>
              <select id={name} name={name} required className="ds-input" defaultValue={fv[name] ?? ""}>
                <option value="">Select</option>
                {MUN_COMMITTEES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError id={`${name}-err`} message={fe[name]} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField name="firstCountry" label="First Country/Portfolio Preference" required defaultValue={fv.firstCountry} error={fe.firstCountry} />
          <TextField name="secondCountry" label="Second Country/Portfolio Preference" required defaultValue={fv.secondCountry} error={fe.secondCountry} />
          <TextField name="thirdCountry" label="Third Country/Portfolio Preference" required defaultValue={fv.thirdCountry} error={fe.thirdCountry} />
        </div>
      </Card>

      <Card>
        <SectionHeading letter="D">Model United Nations Experience</SectionHeading>
        <YesNoField name="hasPriorMun" label="Have you participated in a Model United Nations conference before?" value={hasPriorMun} onChange={setHasPriorMun} error={fe.hasPriorMun} />
        {hasPriorMun === "yes" && (
          <>
            <TextField name="totalConferences" label="Total number of MUN conferences attended" defaultValue={fv.totalConferences} error={fe.totalConferences} />
            <TextAreaField name="previousExperience" label="Previous MUN Experience (conference, year, committee, country/portfolio, award if any)" defaultValue={fv.previousExperience} error={fe.previousExperience} />
          </>
        )}
        <YesNoField
          name="wasLeadership"
          label="Have you previously served as an Executive Board Member, Secretariat Member or Organizer?"
          value={wasLeadership}
          onChange={setWasLeadership}
          error={fe.wasLeadership}
        />
        {wasLeadership === "yes" && (
          <TextAreaField name="leadershipDetails" label="Details of leadership or organizational experience" defaultValue={fv.leadershipDetails} error={fe.leadershipDetails} />
        )}
      </Card>

      <Card>
        <SectionHeading letter="E">Areas of Interest</SectionHeading>
        <fieldset>
          <legend className="ds-label">
            Areas of Interest {req}
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MUN_AREAS_OF_INTEREST.map((a) => (
              <label key={a} className="flex items-center gap-2 text-small">
                <input
                  type="checkbox"
                  name="areasOfInterest"
                  value={a}
                  checked={areasOfInterest.includes(a)}
                  onChange={(e) =>
                    setAreasOfInterest((prev) => (e.target.checked ? [...prev, a] : prev.filter((x) => x !== a)))
                  }
                />
                {MUN_AREA_OF_INTEREST_LABEL[a]}
              </label>
            ))}
          </div>
          <FieldError id="areasOfInterest-err" message={fe.areasOfInterest} />
          {areasOfInterest.includes("other") && (
            <TextField name="areasOfInterestOther" label="Describe your area of interest" defaultValue={fv.areasOfInterestOther} error={fe.areasOfInterestOther} />
          )}
        </fieldset>
      </Card>

      <Card>
        <SectionHeading letter="F">Emergency and Special Requirements</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="emergencyContactName" label="Emergency Contact Name" required defaultValue={fv.emergencyContactName} error={fe.emergencyContactName} />
          <TextField name="emergencyRelationship" label="Relationship with Applicant" required defaultValue={fv.emergencyRelationship} error={fe.emergencyRelationship} />
          <TextField name="emergencyMobile" label="Mobile Number" required defaultValue={fv.emergencyMobile} error={fe.emergencyMobile} />
          <TextField name="emergencyAltMobile" label="Alternative Mobile Number" defaultValue={fv.emergencyAltMobile} error={fe.emergencyAltMobile} />
        </div>
        <TextAreaField name="emergencyAddress" label="Emergency Contact Address" required defaultValue={fv.emergencyAddress} error={fe.emergencyAddress} />

        <YesNoField name="dietaryRestrictions" label="Do you have any dietary restrictions?" value={dietaryRestrictions} onChange={setDietaryRestrictions} error={fe.dietaryRestrictions} />
        {dietaryRestrictions === "yes" && <TextField name="dietaryDetails" label="Please specify" defaultValue={fv.dietaryDetails} error={fe.dietaryDetails} />}

        <YesNoField name="accessibilityNeeds" label="Do you require accessibility assistance?" value={accessibilityNeeds} onChange={setAccessibilityNeeds} error={fe.accessibilityNeeds} />
        {accessibilityNeeds === "yes" && <TextField name="accessibilityDetails" label="Please specify" defaultValue={fv.accessibilityDetails} error={fe.accessibilityDetails} />}

        <YesNoField
          name="medicalRequirements"
          label="Do you have any allergies or emergency medical requirements the organizers should know about?"
          value={medicalRequirements}
          onChange={setMedicalRequirements}
          error={fe.medicalRequirements}
        />
        {medicalRequirements === "yes" && <TextField name="medicalDetails" label="Please specify" defaultValue={fv.medicalDetails} error={fe.medicalDetails} />}

        <div>
          <label htmlFor="foodPreference" className="ds-label">
            Food Preference {req}
          </label>
          <select id="foodPreference" name="foodPreference" required className="ds-input" defaultValue={fv.foodPreference ?? ""}>
            <option value="">Select</option>
            {MUN_FOOD_PREFERENCES.map((f) => (
              <option key={f} value={f}>
                {MUN_FOOD_PREFERENCE_LABEL[f]}
              </option>
            ))}
          </select>
          <FieldError id="foodPreference-err" message={fe.foodPreference} />
        </div>
      </Card>

      <Card>
        <SectionHeading letter="G">Accommodation and Travel</SectionHeading>
        <YesNoField name="needsAccommodation" label="Will you require accommodation assistance?" value={needsAccommodation} onChange={setNeedsAccommodation} error={fe.needsAccommodation} />
        <YesNoField name="fromOutsideDhaka" label="Are you applying from outside Dhaka?" value={fromOutsideDhaka} onChange={setFromOutsideDhaka} error={fe.fromOutsideDhaka} />
        {fromOutsideDhaka === "yes" && (
          <>
            <TextField name="departureDistrict" label="District/Country of Departure" defaultValue={fv.departureDistrict} error={fe.departureDistrict} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField name="arrivalDateTime" label="Expected Date and Time of Arrival" type="datetime-local" defaultValue={fv.arrivalDateTime} error={fe.arrivalDateTime} />
              <TextField name="departureDateTime" label="Expected Date and Time of Departure" type="datetime-local" defaultValue={fv.departureDateTime} error={fe.departureDateTime} />
            </div>
          </>
        )}
        <TextAreaField name="travelNotes" label="Any additional travel or accommodation information" defaultValue={fv.travelNotes} error={fe.travelNotes} />
        <Hint>Accommodation, transportation or related services are not automatically included unless officially confirmed by the PUNAB IMUN Secretariat.</Hint>
      </Card>

      <Card>
        <SectionHeading letter="H">Required Documents</SectionHeading>
        <Hint>Documents must be clear and readable. Photo and student ID are required.</Hint>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DocumentField name="photoFile" label="Recent Passport-Size Photograph" required error={fe.photoFile} />
          <DocumentField name="studentIdFile" label="Student ID Card or Institutional Identification" required error={fe.studentIdFile} />
          <DocumentField name="nationalIdFile" label="National ID Card, Birth Registration or Passport" error={fe.nationalIdFile} />
          <DocumentField name="passportFile" label="Passport Copy (international participants, if applicable)" error={fe.passportFile} />
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] pb-4">
          <h2 className="text-h4 font-semibold text-[color:var(--color-text)]">Early Bird Registration Fee</h2>
          <span className="rounded-full bg-[color:var(--color-brand)] px-4 py-1 text-small font-bold text-white">
            BDT {MUN_REGISTRATION_FEE_BDT}
          </span>
        </div>
        <Hint>
          Applicants must complete the registration payment through one of the officially approved payment methods
          below.
        </Hint>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border-l-4 border-[color:var(--color-brand)] bg-[color:var(--color-surface-2)] p-4 text-small motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
            <p className="font-semibold text-[color:var(--color-text)]">bKash</p>
            <p className="mt-1 font-mono text-h4 font-bold tracking-wide text-[color:var(--color-text)]">01726661411</p>
            <p className="mt-1 text-[color:var(--color-text-muted)]">Personal account. Use the official payment option instructed by the Secretariat.</p>
          </div>
          <div className="rounded-[var(--radius-md)] border-l-4 border-[color:var(--color-brand)] bg-[color:var(--color-surface-2)] p-4 text-small motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
            <p className="font-semibold text-[color:var(--color-text)]">Nagad</p>
            <p className="mt-1 font-mono text-h4 font-bold tracking-wide text-[color:var(--color-text)]">01726661411</p>
            <p className="mt-1 text-[color:var(--color-text-muted)]">Personal account. Use the official payment option instructed by the Secretariat.</p>
          </div>
          <div className="rounded-[var(--radius-md)] border-l-4 border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 text-small sm:col-span-2">
            <p className="font-semibold text-[color:var(--color-text)]">Bank Transfer</p>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-[color:var(--color-text-muted)]">Bank Name</dt>
                <dd className="font-semibold text-[color:var(--color-text)]">City Bank</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-[color:var(--color-text-muted)]">Account Name</dt>
                <dd className="font-semibold text-[color:var(--color-text)]">S.M SHOWKAT HOSSEN MIA</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-[color:var(--color-text-muted)]">Account Number</dt>
                <dd className="font-mono font-semibold text-[color:var(--color-text)]">2304842787001</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-[color:var(--color-text-muted)]">Routing Number</dt>
                <dd className="font-mono font-semibold text-[color:var(--color-text)]">225273238</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-[color:var(--color-text-muted)]">Branch District</dt>
                <dd className="font-semibold text-[color:var(--color-text)]">DHAKA-SOUTH</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-[color:var(--color-text-muted)]">Branch Name</dt>
                <dd className="font-semibold text-[color:var(--color-text)]">JATRABARI BRANCH (DHAKA)</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-[color:var(--color-text-muted)]">SWIFT Code</dt>
                <dd className="font-mono font-semibold text-[color:var(--color-text)]">CIBLBDDH</dd>
              </div>
            </dl>
          </div>
        </div>

        <Hint>
          Registration will not be considered complete until the payment has been successfully verified by the
          PUNAB IMUN Secretariat. Enter the correct transaction ID and sender information below — submission of
          incorrect, edited or fraudulent payment information may result in immediate cancellation of the
          application. Registration fees are generally non-refundable after confirmation, except where otherwise
          officially announced by the Secretariat.
        </Hint>
      </Card>

      <Card>
        <SectionHeading letter="I">Payment Verification</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="paymentMethod" className="ds-label">
              Payment Method {req}
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              className="ds-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="" disabled>
                Select
              </option>
              {MUN_PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {MUN_PAYMENT_METHOD_LABEL[m]}
                </option>
              ))}
            </select>
            <FieldError id="paymentMethod-err" message={fe.paymentMethod} />
          </div>
          <TextField
            name="amountPaid"
            label="Amount Paid (BDT)"
            required
            readOnly
            defaultValue={String(MUN_REGISTRATION_FEE_BDT)}
            error={fe.amountPaid}
          />
          <TextField name="paymentDate" label="Payment Date" type="date" required defaultValue={fv.paymentDate} error={fe.paymentDate} />
          <TextField name="transactionId" label="Transaction ID" required defaultValue={fv.transactionId} error={fe.transactionId} />
          <TextField
            name="paymentSenderInfo"
            label="Sender's Mobile Number or Bank Account Number"
            required
            defaultValue={fv.paymentSenderInfo}
            error={fe.paymentSenderInfo}
          />
          <TextField
            name="paymentAccountHolderName"
            label="Account Holder's Name"
            required
            defaultValue={fv.paymentAccountHolderName}
            error={fe.paymentAccountHolderName}
          />
          {paymentMethod === "bank" && (
            <TextField
              name="paymentBankName"
              label="Bank Name"
              required
              defaultValue={fv.paymentBankName}
              error={fe.paymentBankName}
            />
          )}
          <TextField
            name="paymentDepositSlipRef"
            label="Refference:"
            defaultValue={fv.paymentDepositSlipRef}
            error={fe.paymentDepositSlipRef}
          />
        </div>
        <DocumentField name="paymentProofFile" label="Payment Screenshot / Deposit Slip" error={fe.paymentProofFile} />
        <TextAreaField
          name="paymentAdditionalInfo"
          label="Any additional payment information"
          defaultValue={fv.paymentAdditionalInfo}
          error={fe.paymentAdditionalInfo}
        />
      </Card>

      <Card>
        <SectionHeading>Declaration and Code of Conduct</SectionHeading>
        <label className="flex items-start gap-2 text-small">
          <input type="checkbox" name="declarationAccepted" required className="mt-1" />
          <span>
            I hereby declare that all information and documents submitted in this application are true, complete and
            accurate to the best of my knowledge. I understand my registration will be confirmed only after
            successful payment verification. {req}
          </span>
        </label>
        <FieldError id="declarationAccepted-err" message={fe.declarationAccepted} />
        <label className="flex items-start gap-2 text-small">
          <input type="checkbox" name="codeOfConductAccepted" required className="mt-1" />
          <span>
            I agree to maintain respectful and diplomatic behavior, follow the instructions of the Secretariat and
            Executive Board, maintain proper formal attire during official sessions, and comply with the conference
            Code of Conduct. {req}
          </span>
        </label>
        <FieldError id="codeOfConductAccepted-err" message={fe.codeOfConductAccepted} />
      </Card>

      <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}
