"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { submitBabbfRegistration, type SubmitBabbfRegistrationState } from "@/actions/babbf-registration";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { BLOOD_HERO_BLOOD_GROUPS } from "@/lib/validations/bloodhero-shared";
import {
  BABBF_GENDERS,
  BABBF_GENDER_LABEL,
  BABBF_PAYMENT_METHODS,
  BABBF_PAYMENT_METHOD_LABEL,
  BABBF_REGISTRATION_FEE_BDT,
  BABBF_WEIGHT_CATEGORIES,
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
        accept="image/*"
        className="ds-input cursor-pointer file:mr-3 file:cursor-pointer file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-brand)] file:px-3 file:py-1.5 file:text-small file:font-semibold file:text-white hover:file:opacity-90"
        aria-describedby={error ? `${name}-err` : undefined}
      />
      <FieldError id={`${name}-err`} message={error} />
    </div>
  );
}

export function BabbfRegistrationForm() {
  const [state, formAction, pending] = useActionState(submitBabbfRegistration, initial);
  const fv = state?.fieldValues ?? {};
  const fe = state?.fieldErrors ?? {};

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

      <Card>
        <SectionHeading letter="A">Participant Information</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="fullName" label="Full Name" required defaultValue={fv.fullName} error={fe.fullName} />
          <TextField name="phone" label="Phone Number" required defaultValue={fv.phone} error={fe.phone} />
          <TextField name="email" label="Email Address" type="email" required defaultValue={fv.email} error={fe.email} />
          <TextField name="universityName" label="University Name" required defaultValue={fv.universityName} error={fe.universityName} />
          <TextField name="department" label="Department" required defaultValue={fv.department} error={fe.department} />
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
          <div>
            <label htmlFor="weightCategory" className="ds-label">
              Weight Category {req}
            </label>
            <select id="weightCategory" name="weightCategory" required className="ds-input" defaultValue={fv.weightCategory ?? ""}>
              <option value="">Select</option>
              {BABBF_WEIGHT_CATEGORIES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <FieldError id="weightCategory-err" message={fe.weightCategory} />
          </div>
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
      </Card>

      <Card>
        <SectionHeading letter="B">Participant Photo</SectionHeading>
        <Hint>A recent, clear photograph of the participant. Required for the participant ID card.</Hint>
        <DocumentField name="photoFile" label="Participant Photograph" required error={fe.photoFile} />
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] pb-4">
          <h2 className="text-h4 font-semibold text-[color:var(--color-text)]">Registration Fee</h2>
          <span className="rounded-full bg-[color:var(--color-brand)] px-4 py-1 text-small font-bold text-white">
            BDT {BABBF_REGISTRATION_FEE_BDT}
          </span>
        </div>
        <Hint>
          Pay the registration fee via bKash or Nagad, then enter the transaction ID and upload a screenshot of the
          payment below.
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
          <TextField name="transactionId" label="Transaction ID" required defaultValue={fv.transactionId} error={fe.transactionId} />
        </div>
        <DocumentField name="paymentProofFile" label="Payment Screenshot" required error={fe.paymentProofFile} />
      </Card>

      <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit Registration"}
      </Button>
    </form>
  );
}
