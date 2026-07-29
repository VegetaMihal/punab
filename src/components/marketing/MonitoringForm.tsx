"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { submitMonitoringForm, type SubmitMonitoringFormState } from "@/actions/monitoring-form";
import { Button } from "@/components/ui/Button";
import { UniversityCombobox } from "@/components/marketing/UniversityCombobox";
import {
  MONITORING_CONNECTIONS,
  MONITORING_CONNECTION_LABEL,
  MONITORING_EVIDENCE_ANSWERS,
  MONITORING_OBSERVATIONS,
  MONITORING_OBSERVATION_LABEL,
  MONITORING_PROGRAM_STATUSES,
  MONITORING_PROGRAM_STATUS_LABEL,
  MONITORING_SUPPORTER_REASONS,
  MONITORING_SUPPORTER_REASON_LABEL,
  MONITORING_SUPPORT_ANSWERS,
} from "@/lib/validations/monitoring-form";

const initial: SubmitMonitoringFormState = {};

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

const EVIDENCE_LABEL: Record<(typeof MONITORING_EVIDENCE_ANSWERS)[number], string> = {
  yes: "Yes",
  no: "No",
  later: "Can provide later",
};

const SUPPORT_LABEL: Record<(typeof MONITORING_SUPPORT_ANSWERS)[number], string> = {
  yes: "Yes",
  no: "No",
  not_sure: "Not sure",
};

export function MonitoringForm({ universities }: { universities: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(submitMonitoringForm, initial);
  const [universitySelect, setUniversitySelect] = useState("");
  const [connection, setConnection] = useState("");
  const [hasAdminSupporters, setHasAdminSupporters] = useState("");
  const [hasEvidence, setHasEvidence] = useState("");
  const [observations, setObservations] = useState<string[]>([]);
  const [supporterReasons, setSupporterReasons] = useState<string[]>([]);

  useEffect(() => {
    if (state?.success) toast.success(`Report received — reference ${state.referenceNumber}`);
  }, [state?.success, state?.referenceNumber]);

  if (state?.success) {
    return (
      <div
        className="mx-auto max-w-2xl rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))] px-6 py-8 text-center"
        role="status"
      >
        <p className="text-h4 font-semibold text-[color:var(--color-success)]">Thank you for your report.</p>
        <p className="mt-3 text-[1.02rem] text-[color:var(--color-text-muted)]">
          Your reference number is:
        </p>
        <p className="mt-1 text-h3 font-bold text-[color:var(--color-text)]">{state.referenceNumber}</p>
        <p className="mt-4 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          This is a report, not proof. PUNAB campus teams will verify details before any publication. Political claims
          and names remain private until verified.
        </p>
        <Link
          href="/monitoring-form/results"
          className="mt-6 inline-block font-semibold text-[color:var(--color-brand)] underline-offset-2 hover:underline"
        >
          View public results dashboard
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-8">
      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <input type="hidden" name="stagedEvidenceUrls" value={JSON.stringify(state?.stagedEvidenceUrls ?? [])} />

      <div>
        <label htmlFor="universitySelect" className="ds-label">
          University name {req}
        </label>
        <UniversityCombobox universities={universities} value={universitySelect} onChange={setUniversitySelect} />
        {universitySelect === "__other__" && (
          <input
            name="universityName"
            required
            placeholder="Type your university name"
            className="ds-input mt-2"
            defaultValue={state?.fieldValues?.universityName}
          />
        )}
        {universitySelect !== "__other__" && <input type="hidden" name="universityName" value={universitySelect} />}
        <FieldError id="universityName-err" message={state?.fieldErrors?.universityName} />
      </div>

      <fieldset>
        <legend className="ds-label">Your connection {req}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MONITORING_CONNECTIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-small">
              <input
                type="radio"
                name="connection"
                value={c}
                required
                checked={connection === c}
                onChange={() => setConnection(c)}
              />
              {MONITORING_CONNECTION_LABEL[c]}
            </label>
          ))}
        </div>
        <FieldError id="connection-err" message={state?.fieldErrors?.connection} />
        {connection === "other" && (
          <input
            name="connectionOther"
            placeholder="Describe your connection"
            className="ds-input mt-2"
            defaultValue={state?.fieldValues?.connectionOther}
          />
        )}
      </fieldset>

      <fieldset>
        <legend className="ds-label">July 2026 status {req}</legend>
        <div className="mt-2 space-y-2">
          {MONITORING_PROGRAM_STATUSES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-small">
              <input type="radio" name="programStatus" value={s} required />
              {MONITORING_PROGRAM_STATUS_LABEL[s]}
            </label>
          ))}
        </div>
        <FieldError id="programStatus-err" message={state?.fieldErrors?.programStatus} />
      </fieldset>

      <fieldset>
        <legend className="ds-label">What did you observe? {req}</legend>
        <Hint>Select every option that applies — you can pick more than one.</Hint>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MONITORING_OBSERVATIONS.map((o) => (
            <label key={o} className="flex items-center gap-2 text-small">
              <input
                type="checkbox"
                name="observations"
                value={o}
                checked={observations.includes(o)}
                onChange={(e) =>
                  setObservations((prev) => (e.target.checked ? [...prev, o] : prev.filter((x) => x !== o)))
                }
              />
              {MONITORING_OBSERVATION_LABEL[o]}
            </label>
          ))}
        </div>
        <FieldError id="observations-err" message={state?.fieldErrors?.observations} />
        {observations.includes("other") && (
          <input
            name="observationsOther"
            placeholder="Describe what you observed"
            className="ds-input mt-2"
            defaultValue={state?.fieldValues?.observationsOther}
          />
        )}
      </fieldset>

      <fieldset>
        <legend className="ds-label">Fascist supporters in trustees or administration? {req}</legend>
        <Hint>Do any trustees or administration figures actively back anti-July-movement politics on campus? Choose &ldquo;Not sure&rdquo; if you suspect but can&apos;t confirm.</Hint>
        <div className="mt-2 flex gap-4">
          {MONITORING_SUPPORT_ANSWERS.map((a) => (
            <label key={a} className="flex items-center gap-2 text-small">
              <input
                type="radio"
                name="hasAdminSupporters"
                value={a}
                required
                checked={hasAdminSupporters === a}
                onChange={() => setHasAdminSupporters(a)}
              />
              {SUPPORT_LABEL[a]}
            </label>
          ))}
        </div>
        <FieldError id="hasAdminSupporters-err" message={state?.fieldErrors?.hasAdminSupporters} />
      </fieldset>

      {hasAdminSupporters === "yes" && (
        <div className="space-y-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4">
          <div>
            <label htmlFor="supporterName" className="ds-label">
              Person&apos;s name {req}
            </label>
            <input id="supporterName" name="supporterName" className="ds-input" defaultValue={state?.fieldValues?.supporterName} />
            <FieldError id="supporterName-err" message={state?.fieldErrors?.supporterName} />
          </div>
          <div>
            <label htmlFor="supporterPosition" className="ds-label">
              Position {req}
            </label>
            <input
              id="supporterPosition"
              name="supporterPosition"
              className="ds-input"
              defaultValue={state?.fieldValues?.supporterPosition}
            />
            <FieldError id="supporterPosition-err" message={state?.fieldErrors?.supporterPosition} />
          </div>
          <fieldset>
            <legend className="ds-label">Specific reason {req}</legend>
            <Hint>What specifically makes this person a supporter — pick all that apply.</Hint>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {MONITORING_SUPPORTER_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-small">
                  <input
                    type="checkbox"
                    name="supporterReasons"
                    value={r}
                    checked={supporterReasons.includes(r)}
                    onChange={(e) =>
                      setSupporterReasons((prev) => (e.target.checked ? [...prev, r] : prev.filter((x) => x !== r)))
                    }
                  />
                  {MONITORING_SUPPORTER_REASON_LABEL[r]}
                </label>
              ))}
            </div>
            <FieldError id="supporterReasons-err" message={state?.fieldErrors?.supporterReasons} />
            {supporterReasons.includes("other") && (
              <input
                name="supporterReasonsOther"
                placeholder="Describe the reason"
                className="ds-input mt-2"
                defaultValue={state?.fieldValues?.supporterReasonsOther}
              />
            )}
          </fieldset>
        </div>
      )}

      <div>
        <label htmlFor="description" className="ds-label">
          Short description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Specific action or statement, approximate date, and people involved"
          className="ds-textarea"
          defaultValue={state?.fieldValues?.description}
        />
      </div>

      <fieldset>
        <legend className="ds-label">Evidence available? {req}</legend>
        <Hint>Photos, screenshots, notices, or links help verification move faster — but a report without evidence is still accepted.</Hint>
        <div className="mt-2 flex gap-4">
          {MONITORING_EVIDENCE_ANSWERS.map((a) => (
            <label key={a} className="flex items-center gap-2 text-small">
              <input
                type="radio"
                name="hasEvidence"
                value={a}
                required
                checked={hasEvidence === a}
                onChange={() => setHasEvidence(a)}
              />
              {EVIDENCE_LABEL[a]}
            </label>
          ))}
        </div>
        <FieldError id="hasEvidence-err" message={state?.fieldErrors?.hasEvidence} />
      </fieldset>

      {hasEvidence !== "" && hasEvidence !== "no" && (
        <div>
          <label htmlFor="evidenceFiles" className="ds-label">
            Upload evidence (photo, video, screenshot, notice, email, document — optional)
          </label>
          <input id="evidenceFiles" name="evidenceFiles" type="file" multiple className="ds-input" accept="image/*,video/*,application/pdf" />
          <label htmlFor="evidenceLinkNote" className="ds-label mt-3 block">
            Or paste a link (social post, news article, Drive link)
          </label>
          <input id="evidenceLinkNote" name="evidenceLinkNote" className="ds-input" defaultValue={state?.fieldValues?.evidenceLinkNote} />
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="ds-label">Contact and privacy</legend>
        <label className="flex items-center gap-2 text-small">
          <input type="checkbox" name="contactOk" />
          PUNAB may contact me for follow-up
        </label>
        <input name="contactDetails" placeholder="Contact details (optional)" className="ds-input" defaultValue={state?.fieldValues?.contactDetails} />
        <label className="flex items-center gap-2 text-small">
          <input type="checkbox" name="keepConfidential" defaultChecked />
          Keep my identity confidential
        </label>
        <Hint>
          Contact details are only used by PUNAB&apos;s verification team and are never published. Confidentiality is on
          by default — your name is never shown publicly either way.
        </Hint>
      </fieldset>

      <fieldset>
        <label className="flex items-start gap-2 text-small">
          <input type="checkbox" name="declarationAccepted" required className="mt-1" />
          <span>
            I declare the information above is true to the best of my knowledge and may be verified before
            publication. {req}
          </span>
        </label>
        <FieldError id="declarationAccepted-err" message={state?.fieldErrors?.declarationAccepted} />
      </fieldset>

      <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
