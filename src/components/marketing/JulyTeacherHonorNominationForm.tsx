"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  submitJulyTeacherHonorNomination,
  type JulyTeacherHonorNominationState,
} from "@/actions/july-teacher-honor-nomination";
import { Button } from "@/components/ui/Button";
import {
  emptyJulyTeacherHonorNominationFields,
  type JulyTeacherHonorNominationFieldValues,
} from "@/lib/july-teacher-honor-nomination-fields";

const initial: JulyTeacherHonorNominationState = {};

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

export function JulyTeacherHonorNominationForm() {
  const [state, formAction, pending] = useActionState(submitJulyTeacherHonorNomination, initial);
  const [textFields, setTextFields] = useState<JulyTeacherHonorNominationFieldValues>(() =>
    emptyJulyTeacherHonorNominationFields()
  );

  const patch = (key: keyof JulyTeacherHonorNominationFieldValues, value: string) => {
    setTextFields((p) => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    if (state?.success) toast.success("Nomination submitted.");
  }, [state?.success]);

  useEffect(() => {
    if (state?.success) return;
    if (!state?.fieldValues) return;
    setTextFields((prev) => ({ ...prev, ...state.fieldValues }));
  }, [state?.fieldValues, state?.success]);

  const showFileReselectHint =
    !state?.success && Boolean(state?.fieldValues || state?.fieldErrors || state?.error);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-success)]"
          role="status"
        >
          Thank you — your nomination was received and will be reviewed confidentially.
        </div>
      )}

      <div className="space-y-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 md:p-5">
        <p className="text-small font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">
          Your details
        </p>
        <p className="text-small text-[color:var(--color-text-muted)]">
          Who is submitting this nomination — we may contact you to verify details.
        </p>

        <div>
          <label htmlFor="nominatorFullName" className="ds-label">
            Your full name {req}
          </label>
          <input
            id="nominatorFullName"
            name="nominatorFullName"
            required
            className="ds-input"
            autoComplete="name"
            value={textFields.nominatorFullName}
            onChange={(e) => patch("nominatorFullName", e.target.value)}
            disabled={state?.success}
            aria-describedby={state?.fieldErrors?.nominatorFullName ? "nominatorFullName-err" : undefined}
          />
          <FieldError id="nominatorFullName-err" message={state?.fieldErrors?.nominatorFullName} />
        </div>

        <div>
          <label htmlFor="nominatorEmail" className="ds-label">
            Your email {req}
          </label>
          <input
            id="nominatorEmail"
            name="nominatorEmail"
            type="email"
            required
            className="ds-input"
            autoComplete="email"
            value={textFields.nominatorEmail}
            onChange={(e) => patch("nominatorEmail", e.target.value)}
            disabled={state?.success}
            aria-describedby={state?.fieldErrors?.nominatorEmail ? "nominatorEmail-err" : undefined}
          />
          <FieldError id="nominatorEmail-err" message={state?.fieldErrors?.nominatorEmail} />
        </div>

        <div>
          <label htmlFor="nominatorPhone" className="ds-label">
            Your phone number {req}
          </label>
          <input
            id="nominatorPhone"
            name="nominatorPhone"
            type="tel"
            required
            className="ds-input"
            autoComplete="tel"
            value={textFields.nominatorPhone}
            onChange={(e) => patch("nominatorPhone", e.target.value)}
            disabled={state?.success}
            aria-describedby={state?.fieldErrors?.nominatorPhone ? "nominatorPhone-err" : undefined}
          />
          <FieldError id="nominatorPhone-err" message={state?.fieldErrors?.nominatorPhone} />
        </div>

        <div>
          <label htmlFor="nominatorUniversity" className="ds-label">
            Your university {req}
          </label>
          <input
            id="nominatorUniversity"
            name="nominatorUniversity"
            required
            className="ds-input"
            autoComplete="organization"
            value={textFields.nominatorUniversity}
            onChange={(e) => patch("nominatorUniversity", e.target.value)}
            disabled={state?.success}
            aria-describedby={state?.fieldErrors?.nominatorUniversity ? "nominatorUniversity-err" : undefined}
          />
          <FieldError id="nominatorUniversity-err" message={state?.fieldErrors?.nominatorUniversity} />
        </div>
      </div>

      <div className="space-y-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 md:p-5">
        <p className="text-small font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">
          Teacher you are nominating
        </p>

      <div>
        <label htmlFor="teacherFullName" className="ds-label">
          Teacher&apos;s full name {req}
        </label>
        <input
          id="teacherFullName"
          name="teacherFullName"
          required
          className="ds-input"
          autoComplete="name"
          value={textFields.teacherFullName}
          onChange={(e) => patch("teacherFullName", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.teacherFullName ? "teacherFullName-err" : undefined}
        />
        <FieldError id="teacherFullName-err" message={state?.fieldErrors?.teacherFullName} />
      </div>

      <div>
        <label htmlFor="teacherDesignation" className="ds-label">
          Teacher&apos;s designation {req}
        </label>
        <input
          id="teacherDesignation"
          name="teacherDesignation"
          required
          className="ds-input"
          value={textFields.teacherDesignation}
          onChange={(e) => patch("teacherDesignation", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.teacherDesignation ? "teacherDesignation-err" : undefined}
        />
        <FieldError id="teacherDesignation-err" message={state?.fieldErrors?.teacherDesignation} />
      </div>

      <div>
        <label htmlFor="teacherUniversityName" className="ds-label">
          Teacher&apos;s university {req}
        </label>
        <input
          id="teacherUniversityName"
          name="teacherUniversityName"
          required
          className="ds-input"
          value={textFields.teacherUniversityName}
          onChange={(e) => patch("teacherUniversityName", e.target.value)}
          disabled={state?.success}
          aria-describedby={
            state?.fieldErrors?.teacherUniversityName ? "teacherUniversityName-err" : undefined
          }
        />
        <FieldError id="teacherUniversityName-err" message={state?.fieldErrors?.teacherUniversityName} />
      </div>

      <div>
        <label htmlFor="departmentSubject" className="ds-label">
          Department / subject {req}
        </label>
        <input
          id="departmentSubject"
          name="departmentSubject"
          required
          className="ds-input"
          value={textFields.departmentSubject}
          onChange={(e) => patch("departmentSubject", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.departmentSubject ? "departmentSubject-err" : undefined}
        />
        <FieldError id="departmentSubject-err" message={state?.fieldErrors?.departmentSubject} />
      </div>

      <div>
        <label htmlFor="teacherPhone" className="ds-label">
          Teacher&apos;s phone number {req}
        </label>
        <input
          id="teacherPhone"
          name="teacherPhone"
          type="tel"
          required
          className="ds-input"
          autoComplete="tel"
          value={textFields.teacherPhone}
          onChange={(e) => patch("teacherPhone", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.teacherPhone ? "teacherPhone-err" : undefined}
        />
        <FieldError id="teacherPhone-err" message={state?.fieldErrors?.teacherPhone} />
      </div>

      <div>
        <label htmlFor="teacherEmail" className="ds-label">
          Teacher&apos;s email {req}
        </label>
        <input
          id="teacherEmail"
          name="teacherEmail"
          type="email"
          required
          className="ds-input"
          autoComplete="email"
          value={textFields.teacherEmail}
          onChange={(e) => patch("teacherEmail", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.teacherEmail ? "teacherEmail-err" : undefined}
        />
        <FieldError id="teacherEmail-err" message={state?.fieldErrors?.teacherEmail} />
      </div>

      <div>
        <label htmlFor="teacherSocialLink" className="ds-label">
          Teacher&apos;s social network link {req}
        </label>
        <input
          id="teacherSocialLink"
          name="teacherSocialLink"
          type="url"
          required
          placeholder="https://"
          className="ds-input"
          value={textFields.teacherSocialLink}
          onChange={(e) => patch("teacherSocialLink", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.teacherSocialLink ? "teacherSocialLink-err" : undefined}
        />
        <FieldError id="teacherSocialLink-err" message={state?.fieldErrors?.teacherSocialLink} />
      </div>
      </div>

      <div>
        <label htmlFor="nominationNarrative" className="ds-label">
          Nomination narrative {req}
        </label>
        <textarea
          id="nominationNarrative"
          name="nominationNarrative"
          required
          rows={8}
          className="ds-textarea mt-2"
          value={textFields.nominationNarrative}
          onChange={(e) => patch("nominationNarrative", e.target.value)}
          disabled={state?.success}
          aria-describedby={
            state?.fieldErrors?.nominationNarrative ? "nominationNarrative-err" : undefined
          }
        />
        <FieldError id="nominationNarrative-err" message={state?.fieldErrors?.nominationNarrative} />
      </div>

      <div>
        <label htmlFor="supportingFile" className="ds-label">
          Supporting documents, photos, videos, or screenshots
        </label>
        <p className="mt-1 text-small text-[color:var(--color-text-muted)]">
          Optional. Image, PDF, or MP4/WebM — max 10 MB. A public link is stored with your row.
        </p>
        {showFileReselectHint && (
          <p className="mt-1 text-small text-[color:var(--color-text-muted)]">
            After an error, choose the file again if you still want to attach one.
          </p>
        )}
        <input
          id="supportingFile"
          name="supportingFile"
          type="file"
          className="mt-2 block w-full text-small text-[color:var(--color-text-muted)] file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold file:text-[color:var(--color-text)]"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,video/mp4,video/webm"
          disabled={state?.success}
        />
      </div>

      <div>
        <label htmlFor="referenceLinks" className="ds-label">
          Links to news reports, social posts, or public references
        </label>
        <p className="mt-1 text-small text-[color:var(--color-text-muted)]">
          Optional. One full URL per line (https://…).
        </p>
        <textarea
          id="referenceLinks"
          name="referenceLinks"
          rows={4}
          className="ds-textarea mt-2"
          placeholder={"https://…\nhttps://…"}
          value={textFields.referenceLinks}
          onChange={(e) => patch("referenceLinks", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.referenceLinks ? "referenceLinks-err" : undefined}
        />
        <FieldError id="referenceLinks-err" message={state?.fieldErrors?.referenceLinks} />
      </div>

      <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto" disabled={state?.success}>
        {pending ? "Submitting…" : "Submit nomination"}
      </Button>

      <p className="text-center text-small text-[color:var(--color-text-muted)]">
        <Link href="/july-award-2026" className="font-semibold text-[color:var(--color-brand)] underline-offset-2 hover:underline">
          Back to July Award 2026
        </Link>
        {" · "}
        <Link href="/contact" className="font-semibold text-[color:var(--color-brand)] underline-offset-2 hover:underline">
          Contact
        </Link>
      </p>
    </form>
  );
}
