"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  submitJulyInjuredStudentRegistration,
  type JulyInjuredStudentRegistrationState,
} from "@/actions/july-injured-student-registration";
import { Button } from "@/components/ui/Button";
import {
  emptyJulyInjuredStudentFields,
  type JulyInjuredStudentFieldValues,
} from "@/lib/july-injured-student-fields";

const initial: JulyInjuredStudentRegistrationState = {};

const req = (
  <span className="text-[color:var(--color-error)]" aria-hidden>
    *
  </span>
);

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-small font-medium text-[color:var(--color-error)]" role="alert">
      {message}
    </p>
  );
}

export function JulyInjuredStudentRegistrationForm() {
  const [state, formAction, pending] = useActionState(submitJulyInjuredStudentRegistration, initial);
  const [textFields, setTextFields] = useState<JulyInjuredStudentFieldValues>(() => emptyJulyInjuredStudentFields());

  const patch = (key: keyof JulyInjuredStudentFieldValues, value: string) => {
    setTextFields((p) => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    if (state?.success) toast.success("Registration received.");
  }, [state?.success]);

  useEffect(() => {
    if (state?.success) return;
    if (!state?.fieldValues) return;
    setTextFields((prev) => ({ ...prev, ...state.fieldValues }));
  }, [state?.fieldValues, state?.success]);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {state?.success ? (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))] px-4 py-4 text-[color:var(--color-text)]"
          role="status"
        >
          <p className="text-base font-semibold text-[color:var(--color-success)]">We will call you to confirm.</p>
          <p className="mt-2 text-small leading-relaxed text-[color:var(--color-text-muted)]">
            Your registration was saved. Our team will phone the number you provided to verify your details. Thank you.
          </p>
        </div>
      ) : (
        <div
          className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-small leading-relaxed text-[color:var(--color-text-muted)]"
          role="note"
        >
          <strong className="font-semibold text-[color:var(--color-text)]">First:</strong> after you submit, we will{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">call you</strong> on the phone number you
          enter to confirm your registration before any next step.
        </div>
      )}

      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {!state?.success && (
        <>
          <div>
            <label htmlFor="fullName" className="ds-label">
              Full name {req}
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              className="ds-input"
              autoComplete="name"
              value={textFields.fullName}
              onChange={(e) => patch("fullName", e.target.value)}
              aria-describedby={state?.fieldErrors?.fullName ? "fullName-err" : undefined}
            />
            <FieldError id="fullName-err" message={state?.fieldErrors?.fullName} />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="ds-label">
              Phone number {req}
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              className="ds-input"
              autoComplete="tel"
              value={textFields.phoneNumber}
              onChange={(e) => patch("phoneNumber", e.target.value)}
              aria-describedby={state?.fieldErrors?.phoneNumber ? "phoneNumber-err" : undefined}
            />
            <FieldError id="phoneNumber-err" message={state?.fieldErrors?.phoneNumber} />
          </div>

          <div>
            <label htmlFor="universityName" className="ds-label">
              University {req}
            </label>
            <input
              id="universityName"
              name="universityName"
              required
              className="ds-input"
              autoComplete="organization"
              value={textFields.universityName}
              onChange={(e) => patch("universityName", e.target.value)}
              aria-describedby={state?.fieldErrors?.universityName ? "universityName-err" : undefined}
            />
            <FieldError id="universityName-err" message={state?.fieldErrors?.universityName} />
          </div>

          <div>
            <label htmlFor="injuryDescription" className="ds-label">
              Injury or condition {req}
            </label>
            <textarea
              id="injuryDescription"
              name="injuryDescription"
              required
              rows={4}
              className="ds-textarea"
              value={textFields.injuryDescription}
              onChange={(e) => patch("injuryDescription", e.target.value)}
              aria-describedby={state?.fieldErrors?.injuryDescription ? "injuryDescription-err" : undefined}
            />
            <FieldError id="injuryDescription-err" message={state?.fieldErrors?.injuryDescription} />
          </div>

          <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto">
            {pending ? "Submitting…" : "Submit registration"}
          </Button>
        </>
      )}

      <p className="text-center text-small text-[color:var(--color-text-muted)]">
        <Link href="/july-award-2026" className="font-semibold text-[color:var(--color-brand)] underline-offset-2 hover:underline">
          Back to July Award 2026
        </Link>
      </p>
    </form>
  );
}
