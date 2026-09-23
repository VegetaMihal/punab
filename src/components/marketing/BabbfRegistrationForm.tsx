"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { submitBabbfRegistration, type SubmitBabbfRegistrationState } from "@/actions/babbf-registration";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { BLOOD_HERO_BLOOD_GROUPS } from "@/lib/validations/bloodhero-shared";
import {
  babbfWeightCategoriesFor,
  BABBF_BODYBUILDING_WEIGHT_CLASSES,
  BABBF_MENS_PHYSIQUE_HEIGHT_CLASSES,
  BABBF_JUNIOR_MENS_PHYSIQUE_CLASSES,
  BABBF_DENIM_JEANS_CLASSES,
  BABBF_GENDERS,
  BABBF_GENDER_LABEL,
  BABBF_PAYMENT_METHODS,
  BABBF_PAYMENT_METHOD_LABEL,
  BABBF_REGISTRATION_FEE_BDT,
  BABBF_STUDENT_CATEGORIES,
  BABBF_STUDENT_CATEGORY_LABEL,
  type BabbfEventType,
  type BabbfStudentCategory,
} from "@/lib/validations/babbf-registration";

const initial: SubmitBabbfRegistrationState = {};

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
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => setDismissed(false), [error]);
  const shownError = dismissed ? undefined : error;
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
        onChange={() => error && setDismissed(true)}
        aria-describedby={shownError ? `${name}-err` : undefined}
      />
      <FieldError id={`${name}-err`} message={shownError} />
    </div>
  );
}

function DocumentField({
  name,
  label,
  required,
  error,
  uploadedUrl,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  uploadedUrl?: string;
}) {
  // A staged upload from a previous submit attempt already lives server-side — don't force the
  // browser to demand a fresh file pick, or a validation error on another field would strand it.
  const isRequired = required && !uploadedUrl;
  return (
    <div>
      <label htmlFor={name} className="ds-label">
        {label} {isRequired && req}
      </label>
      {uploadedUrl && (
        <p className="mb-1.5 text-small font-medium text-emerald-600">
          ✓ Uploaded — pick a new file only if you want to replace it.
        </p>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        required={isRequired}
        className="ds-input cursor-pointer file:mr-3 file:cursor-pointer file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-brand)] file:px-3 file:py-1.5 file:text-small file:font-semibold file:text-white hover:file:opacity-90"
        aria-describedby={error ? `${name}-err` : undefined}
      />
      <FieldError id={`${name}-err`} message={error} />
    </div>
  );
}

export function BabbfRegistrationForm({ eventType }: { eventType: BabbfEventType }) {
  const [state, formAction, pending] = useActionState(submitBabbfRegistration, initial);
  const isArmwrestling = eventType === "armwrestling";
  const fv = state?.fieldValues ?? {};
  const fe = state?.fieldErrors ?? {};

  const staged = state?.stagedDocumentUrls ?? {};

  const [studentCategory, setStudentCategory] = useState<string>(fv.studentCategory ?? "university");
  const categoryOptions = babbfWeightCategoriesFor(studentCategory);

  const [paymentMethod, setPaymentMethod] = useState(fv.paymentMethod ?? "");
  const [referenceHint] = useState(() => `BABBF-2026-DRAFT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);

  useEffect(() => {
    if (state?.success) {
      toast.success("Registration submitted");
      return;
    }
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.fieldErrors && Object.keys(state.fieldErrors).length > 0) {
      const count = Object.keys(state.fieldErrors).length;
      toast.error(`${count} field${count > 1 ? "s" : ""} need attention`);
      const firstKey = Object.keys(state.fieldErrors)[0];
      const el = document.getElementById(firstKey) ?? document.getElementById(`${firstKey}-err`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state?.success) {
    return (
      <div className="mx-auto max-w-xl motion-safe:animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)] rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-2xl text-white motion-safe:animate-[popIn_500ms_cubic-bezier(0.34,1.56,0.64,1)_150ms_both]">
          ✓
        </span>
        <p className="mt-4 text-h4 font-semibold text-[color:var(--color-text)]">Registration submitted</p>
        <p className="mt-3 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          Reference: <strong className="text-[color:var(--color-text)]">{state.referenceNumber}</strong>
          <br />
          Your registration is <strong>pending</strong> until the organizing committee manually verifies your
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
      <input type="hidden" name="referenceHint" value={referenceHint} />
      <input type="hidden" name="eventType" value={eventType} />

      <Card>
        <SectionHeading letter="A">Participant Information</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="fullName" label="Full Name" required defaultValue={fv.fullName} error={fe.fullName} />
          <TextField name="phone" label="Phone Number" required defaultValue={fv.phone} error={fe.phone} />
          <TextField name="email" label="Email Address" type="email" required defaultValue={fv.email} error={fe.email} />
          <TextField name="universityName" label="Institution Name" required defaultValue={fv.universityName} error={fe.universityName} />
          {!isArmwrestling && (
            <TextField name="department" label="Department" required defaultValue={fv.department} error={fe.department} />
          )}
          {isArmwrestling && (
            <TextField
              name="studentIdOrNid"
              label="Student ID / Student Status / NID"
              required
              defaultValue={fv.studentIdOrNid}
              error={fe.studentIdOrNid}
            />
          )}
          <div>
            <label htmlFor="gender" className="ds-label">
              Gender {req}
            </label>
            <select id="gender" name="gender" required className="ds-input" defaultValue={fv.gender ?? ""}>
              <option value="">Select</option>
              {BABBF_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {BABBF_GENDER_LABEL[g]}
                </option>
              ))}
            </select>
            <FieldError id="gender-err" message={fe.gender} />
          </div>
          {isArmwrestling && (
            <div>
              <label htmlFor="studentCategory" className="ds-label">
                Student Category {req}
              </label>
              <select
                id="studentCategory"
                name="studentCategory"
                required
                className="ds-input"
                value={studentCategory}
                onChange={(e) => setStudentCategory(e.target.value)}
              >
                {BABBF_STUDENT_CATEGORIES.map((sc) => (
                  <option key={sc} value={sc}>
                    {BABBF_STUDENT_CATEGORY_LABEL[sc as BabbfStudentCategory]}
                  </option>
                ))}
              </select>
              <FieldError id="studentCategory-err" message={fe.studentCategory} />
            </div>
          )}
          {isArmwrestling && (
            <div>
              <label htmlFor="category" className="ds-label">
                Weight Category {req}
              </label>
              <select id="category" name="category" required className="ds-input" defaultValue={fv.category ?? ""}>
                <option value="">Select</option>
                {categoryOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <FieldError id="category-err" message={fe.category} />
            </div>
          )}
          <div>
            <label htmlFor="bloodGroup" className="ds-label">
              Blood Group
            </label>
            <select id="bloodGroup" name="bloodGroup" className="ds-input" defaultValue={fv.bloodGroup ?? ""}>
              <option value="">Prefer not to say</option>
              {BLOOD_HERO_BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <FieldError id="bloodGroup-err" message={fe.bloodGroup} />
          </div>
        </div>

        {!isArmwrestling && (
          <div className="grid grid-cols-1 gap-4 border-t border-[color:var(--color-border)] pt-5 sm:grid-cols-2">
            <div>
              <label htmlFor="bodybuildingClass" className="ds-label">
                Bodybuilding
              </label>
              <select
                id="bodybuildingClass"
                name="bodybuildingClass"
                className="ds-input"
                defaultValue={fv.bodybuildingClass ?? ""}
              >
                <option value="">Not entering</option>
                {BABBF_BODYBUILDING_WEIGHT_CLASSES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <FieldError id="bodybuildingClass-err" message={fe.bodybuildingClass} />
            </div>

            <div>
              <label htmlFor="physiqueClass" className="ds-label">
                Men&apos;s Physique
              </label>
              <select
                id="physiqueClass"
                name="physiqueClass"
                className="ds-input"
                defaultValue={fv.physiqueClass ?? ""}
              >
                <option value="">Not entering</option>
                {BABBF_MENS_PHYSIQUE_HEIGHT_CLASSES.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <FieldError id="physiqueClass-err" message={fe.physiqueClass} />
            </div>

            <div>
              <label htmlFor="juniorPhysiqueClass" className="ds-label">
                Junior Men&apos;s Physique
              </label>
              <select
                id="juniorPhysiqueClass"
                name="juniorPhysiqueClass"
                className="ds-input"
                defaultValue={fv.juniorPhysiqueClass ?? ""}
              >
                <option value="">Not entering</option>
                {BABBF_JUNIOR_MENS_PHYSIQUE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError id="juniorPhysiqueClass-err" message={fe.juniorPhysiqueClass} />
            </div>

            <div>
              <label htmlFor="denimClass" className="ds-label">
                Denim Jeans Model Fitness
              </label>
              <select id="denimClass" name="denimClass" className="ds-input" defaultValue={fv.denimClass || BABBF_DENIM_JEANS_CLASSES[0]}>
                {BABBF_DENIM_JEANS_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError id="denimClass-err" message={fe.denimClass} />
            </div>
          </div>
        )}

        {isArmwrestling && (
          <div className="space-y-3 border-t border-[color:var(--color-border)] pt-5">
            <label className="flex items-start gap-2 text-small text-[color:var(--color-text)]">
              <input
                type="checkbox"
                name="rightHandConfirmed"
                value="true"
                required
                defaultChecked={fv.rightHandConfirmed === "true"}
                className="mt-0.5"
              />
              I confirm I will compete using my right hand. {req}
            </label>
            <FieldError id="rightHandConfirmed-err" message={fe.rightHandConfirmed} />
            <label className="flex items-start gap-2 text-small text-[color:var(--color-text)]">
              <input
                type="checkbox"
                name="declarationAccepted"
                value="true"
                required
                defaultChecked={fv.declarationAccepted === "true"}
                className="mt-0.5"
              />
              I declare that the information provided above is accurate and I agree to the competition rules and
              terms of participation. {req}
            </label>
            <FieldError id="declarationAccepted-err" message={fe.declarationAccepted} />
          </div>
        )}

      </Card>

      <Card>
        <SectionHeading letter="B">Participant Photo</SectionHeading>
        <Hint>A recent, clear photograph of the participant. Required for the participant ID card.</Hint>
        <DocumentField
          name="photoFile"
          label="Participant Photograph"
          required
          error={fe.photoFile}
          uploadedUrl={staged.photoUrl}
        />
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] pb-4">
          <h2 className="text-h4 font-semibold text-[color:var(--color-text)]">Registration Fee</h2>
          <span className="rounded-full bg-[color:var(--color-brand)] px-4 py-1 text-small font-bold text-white">
            BDT {BABBF_REGISTRATION_FEE_BDT}
          </span>
        </div>
        <Hint>
          Pay the registration fee via bKash or Nagad to PUNAB&apos;s number{" "}
          <strong className="text-[color:var(--color-text)]">01701062850</strong>, then enter the transaction ID and
          upload a screenshot of the payment below.
        </Hint>

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
              {BABBF_PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {BABBF_PAYMENT_METHOD_LABEL[m]}
                </option>
              ))}
            </select>
            <FieldError id="paymentMethod-err" message={fe.paymentMethod} />
          </div>
          <TextField
            name="paymentSenderNumber"
            label="Sender's bKash/Nagad Number"
            required
            defaultValue={fv.paymentSenderNumber}
            error={fe.paymentSenderNumber}
          />
          <TextField name="transactionId" label="Transaction ID" required defaultValue={fv.transactionId} error={fe.transactionId} />
        </div>
        <DocumentField
          name="paymentProofFile"
          label="Payment Screenshot"
          required
          error={fe.paymentProofFile}
          uploadedUrl={staged.paymentScreenshotUrl}
        />
      </Card>

      <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit Registration"}
      </Button>
    </form>
  );
}
