"use client";

import Link from "next/link";
import {
  useActionState,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  submitBloodHeroRequest,
  type BloodHeroRequestActionState,
} from "@/actions/bloodhero-request";
import {
  bloodHeroRequestFieldErrors,
  bloodHeroRequestFormSchema,
  parseBloodHeroRequestFormData,
} from "@/lib/validations/bloodhero-request";
import { BLOOD_HERO_BLOOD_GROUPS } from "@/lib/validations/bloodhero-shared";
import { BloodHeroVoiceRecorder } from "./BloodHeroVoiceRecorder";

const initial: BloodHeroRequestActionState = {};

const sectionKickerClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400";

const sectionSubtitleClass = "mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400";

const labelClass = "block text-sm font-semibold text-zinc-800 dark:text-zinc-100";

const req = (
  <span className="text-red-600 dark:text-red-400" aria-hidden>
    *
  </span>
);

const controlClass =
  "mt-2 w-full min-h-[2.75rem] rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:min-h-0 sm:text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const hintClass = "mt-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400";

const errClass = "mt-1.5 text-sm font-medium text-red-600 dark:text-red-400";

/** Groups fields on small screens; flat on `sm+` to match desktop calm. */
function SectionCard({
  step,
  titleId,
  title,
  subtitle,
  children,
}: {
  step: string;
  titleId: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/35 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
      <div className="mb-5 sm:mb-4">
        <p className={sectionKickerClass}>{step}</p>
        <h2 id={titleId} className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        <p className={sectionSubtitleClass}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function mergeFieldErrors(
  server: Record<string, string> | undefined,
  client: Record<string, string> | undefined
): Record<string, string> {
  return { ...(client ?? {}), ...(server ?? {}) };
}

function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className={hintClass}>
      {children}
    </p>
  );
}

/** `min` for `<input type="datetime-local" />` in local wall time. */
function datetimeLocalMinOneMinuteAgo(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - 1);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function CopyTrackingButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable — user can select the number manually */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-4 inline-flex min-h-[2.75rem] w-full max-w-xs items-center justify-center rounded-xl border border-emerald-700/25 bg-white px-4 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-100/80 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-900/50 sm:w-auto"
    >
      {copied ? "Copied to clipboard" : "Copy tracking number"}
    </button>
  );
}

export function BloodHeroRequestForm() {
  const [state, formAction] = useActionState(submitBloodHeroRequest, initial);
  const [isPending, startTransition] = useTransition();
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [patientCondition, setPatientCondition] = useState("");
  const [voiceTranscriptForServer, setVoiceTranscriptForServer] = useState<string | null>(null);

  const fieldErrors = mergeFieldErrors(state.fieldErrors, clientErrors);
  const pending = isPending;
  const dtMin = datetimeLocalMinOneMinuteAgo();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = bloodHeroRequestFormSchema.safeParse(parseBloodHeroRequestFormData(fd));
    if (!parsed.success) {
      setClientErrors(bloodHeroRequestFieldErrors(parsed.error));
      return;
    }
    setClientErrors({});
    startTransition(() => {
      formAction(fd);
    });
  }

  if (state.success && state.trackingNumber) {
    const code = state.trackingNumber;
    return (
      <div
        className="rounded-2xl border border-emerald-200/90 bg-emerald-50/95 px-5 py-8 text-center sm:px-8 dark:border-emerald-900/45 dark:bg-emerald-950/40"
        role="status"
      >
        <p className="text-lg font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">
          Your request is recorded
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
          <strong>Save your tracking number.</strong> It is the only thing you need to check progress on the
          Track Request page. You can write it down, take a screenshot, or copy it below.
        </p>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300/90">
          Your tracking number
        </p>
        <p
          className="mx-auto mt-2 max-w-full break-all font-mono text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-3xl"
          aria-live="polite"
        >
          {code}
        </p>
        <CopyTrackingButton text={code} />
        <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-emerald-800/90 dark:text-emerald-200/80">
          Later, we can email this code to the address you provided. For now, please keep it somewhere safe.
        </p>
        <p className="mt-6">
          <Link
            href="/bloodhero/track"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Track this request
          </Link>
        </p>
        <p className="mx-auto mt-5 max-w-sm text-xs leading-relaxed text-emerald-800/85 dark:text-emerald-200/75">
          If anything changes, reach the team through the main PUNAB site so the request can be updated.
        </p>
      </div>
    );
  }

  if (state.success && !state.trackingNumber) {
    return (
      <div
        className="rounded-2xl border border-amber-200/90 bg-amber-50/95 px-5 py-8 text-center sm:px-8 dark:border-amber-900/45 dark:bg-amber-950/35"
        role="status"
      >
        <p className="text-lg font-semibold text-amber-950 dark:text-amber-50">Request may have been saved</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-amber-900/90 dark:text-amber-100/90">
          We could not show a tracking number. Please contact BloodHero with your details so they can find
          your request.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
      <div className="rounded-2xl border border-red-100/90 bg-gradient-to-b from-red-50/60 via-white to-white px-4 py-4 dark:border-red-950/35 dark:from-red-950/25 dark:via-zinc-950 dark:to-zinc-950 sm:px-5 sm:py-4">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">When minutes matter</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          A short form, no login. Clear, honest details help coordinators act fast. Inaccurate requests put
          lives at risk—please double-check before you send.
        </p>
      </div>

      {state.error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-snug text-red-900 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-100"
          role="alert"
          aria-live="assertive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="space-y-6 sm:space-y-8">
        <SectionCard
          step="Step 1 of 3"
          titleId="req-h-you"
          title="Your contact"
          subtitle="Who we reach first if we need to clarify."
        >
          <div className="space-y-5 sm:space-y-4">
            <div>
              <label htmlFor="requester_name" className={labelClass}>
                Your name {req}
              </label>
              <input
                id="requester_name"
                name="requester_name"
                type="text"
                autoComplete="name"
                required
                className={controlClass}
                placeholder="Name for callbacks"
                aria-invalid={fieldErrors.requester_name ? true : undefined}
                aria-describedby={fieldErrors.requester_name ? "err-requester_name" : undefined}
              />
              {fieldErrors.requester_name ? (
                <p id="err-requester_name" className={errClass}>
                  {fieldErrors.requester_name}
                </p>
              ) : null}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="requester_email" className={labelClass}>
                  Your email {req}
                </label>
                <input
                  id="requester_email"
                  name="requester_email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  className={controlClass}
                  placeholder="you@example.com"
                  aria-invalid={fieldErrors.requester_email ? true : undefined}
                  aria-describedby={
                    fieldErrors.requester_email ? "err-requester_email" : "hint-requester_email"
                  }
                />
                {fieldErrors.requester_email ? (
                  <p id="err-requester_email" className={errClass}>
                    {fieldErrors.requester_email}
                  </p>
                ) : (
                  <FieldHint id="hint-requester_email">Coordination updates only.</FieldHint>
                )}
              </div>
              <div>
                <label htmlFor="requester_phone" className={labelClass}>
                  Your phone {req}
                </label>
                <input
                  id="requester_phone"
                  name="requester_phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  className={controlClass}
                  placeholder="Number you answer"
                  aria-invalid={fieldErrors.requester_phone ? true : undefined}
                  aria-describedby={fieldErrors.requester_phone ? "err-requester_phone" : undefined}
                />
                {fieldErrors.requester_phone ? (
                  <p id="err-requester_phone" className={errClass}>
                    {fieldErrors.requester_phone}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step="Step 2 of 3"
          titleId="req-h-patient"
          title="Patient & need"
          subtitle="What coordinators must know to prioritize help."
        >
          <div className="space-y-5 sm:space-y-4">
            <div>
              <label htmlFor="patient_name" className={labelClass}>
                Patient name {req}
              </label>
              <input
                id="patient_name"
                name="patient_name"
                type="text"
                autoComplete="off"
                required
                className={controlClass}
                placeholder="As used at the hospital"
                aria-invalid={fieldErrors.patient_name ? true : undefined}
                aria-describedby={fieldErrors.patient_name ? "err-patient_name" : undefined}
              />
              {fieldErrors.patient_name ? (
                <p id="err-patient_name" className={errClass}>
                  {fieldErrors.patient_name}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="patient_condition" className={labelClass}>
                Condition or notes <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <FieldHint id="hint-patient_condition_voice">
                Choose <strong className="font-semibold text-zinc-700 dark:text-zinc-200">English</strong> or{" "}
                <strong className="font-semibold text-zinc-700 dark:text-zinc-200">বাংলা</strong>, then tap{" "}
                <strong className="font-semibold text-zinc-700 dark:text-zinc-200">Speak</strong> — we transcribe when
                you press Stop. You can type or edit the text below as well.
              </FieldHint>
              <div className="mt-2 w-full min-w-0">
                <BloodHeroVoiceRecorder
                  disabled={pending}
                  onTranscript={(transcript) => {
                    setPatientCondition(transcript);
                    setVoiceTranscriptForServer(transcript);
                  }}
                />
              </div>
              <textarea
                id="patient_condition"
                name="patient_condition"
                rows={3}
                value={patientCondition}
                onChange={(e) => setPatientCondition(e.target.value)}
                className={`${controlClass} min-h-[5.5rem] resize-y`}
                placeholder="Brief context—no full history needed"
                aria-invalid={fieldErrors.patient_condition ? true : undefined}
                aria-describedby={
                  fieldErrors.patient_condition
                    ? "err-patient_condition"
                    : "hint-patient_condition_voice"
                }
              />
              {voiceTranscriptForServer ? (
                <input type="hidden" name="condition_voice_transcript" value={voiceTranscriptForServer} />
              ) : null}
              {voiceTranscriptForServer ? (
                <p className={`${hintClass} font-medium text-zinc-600 dark:text-zinc-300`}>
                  Transcribed from voice
                </p>
              ) : null}
              {fieldErrors.patient_condition ? (
                <p id="err-patient_condition" className={errClass}>
                  {fieldErrors.patient_condition}
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step="Step 3 of 3"
          titleId="req-h-logistics"
          title="Where & when"
          subtitle="So donors and coordinators align on place, group, and timing."
        >
          <div className="space-y-5 sm:space-y-5">
            <div>
              <label htmlFor="donation_location" className={labelClass}>
                Hospital or venue {req}
              </label>
              <input
                id="donation_location"
                name="donation_location"
                type="text"
                autoComplete="off"
                required
                className={controlClass}
                placeholder="Hospital name, ward if known"
                aria-invalid={fieldErrors.donation_location ? true : undefined}
                aria-describedby={
                  fieldErrors.donation_location ? "err-donation_location" : undefined
                }
              />
              {fieldErrors.donation_location ? (
                <p id="err-donation_location" className={errClass}>
                  {fieldErrors.donation_location}
                </p>
              ) : null}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="district" className={labelClass}>
                  District / area {req}
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  autoComplete="address-level2"
                  required
                  className={controlClass}
                  placeholder="e.g. Dhaka"
                  aria-invalid={fieldErrors.district ? true : undefined}
                  aria-describedby={fieldErrors.district ? "err-district" : "hint-district"}
                />
                {fieldErrors.district ? (
                  <p id="err-district" className={errClass}>
                    {fieldErrors.district}
                  </p>
                ) : (
                  <FieldHint id="hint-district">Nearby matching.</FieldHint>
                )}
              </div>
              <div>
                <label htmlFor="blood_group" className={labelClass}>
                  Blood group needed {req}
                </label>
                <select
                  id="blood_group"
                  name="blood_group"
                  required
                  defaultValue=""
                  className={controlClass}
                  aria-invalid={fieldErrors.blood_group ? true : undefined}
                  aria-describedby={fieldErrors.blood_group ? "err-blood_group" : undefined}
                >
                  <option value="" disabled>
                    Select group
                  </option>
                  {BLOOD_HERO_BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {fieldErrors.blood_group ? (
                  <p id="err-blood_group" className={errClass}>
                    {fieldErrors.blood_group}
                  </p>
                ) : null}
              </div>
            </div>

            <fieldset
              className="space-y-4 rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-4 sm:p-5 dark:border-zinc-700 dark:bg-zinc-900/40"
              aria-labelledby="req-timing-legend"
            >
              <legend id="req-timing-legend" className="sr-only">
                Timing and quantity
              </legend>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Timing & amount</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  When help is needed (now or later) and how many units.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label htmlFor="planned_donation_at" className={labelClass}>
                    When blood is needed {req}
                  </label>
                  <input
                    id="planned_donation_at"
                    name="planned_donation_at"
                    type="datetime-local"
                    required
                    min={dtMin}
                    className={controlClass}
                    aria-invalid={fieldErrors.planned_donation_at ? true : undefined}
                    aria-describedby={
                      fieldErrors.planned_donation_at ? "err-planned_donation_at" : "hint-planned"
                    }
                  />
                  {fieldErrors.planned_donation_at ? (
                    <p id="err-planned_donation_at" className={errClass}>
                      {fieldErrors.planned_donation_at}
                    </p>
                  ) : (
                    <FieldHint id="hint-planned">Your local time, from now onward.</FieldHint>
                  )}
                </div>
                <div>
                  <label htmlFor="request_quantity" className={labelClass}>
                    Units needed {req}
                  </label>
                  <input
                    id="request_quantity"
                    name="request_quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={50}
                    defaultValue={1}
                    required
                    className={controlClass}
                    aria-invalid={fieldErrors.request_quantity ? true : undefined}
                    aria-describedby={
                      fieldErrors.request_quantity ? "err-request_quantity" : "hint-qty"
                    }
                  />
                  {fieldErrors.request_quantity ? (
                    <p id="err-request_quantity" className={errClass}>
                      {fieldErrors.request_quantity}
                    </p>
                  ) : (
                    <FieldHint id="hint-qty">Whole units, 1–50.</FieldHint>
                  )}
                </div>
              </div>
            </fieldset>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-3 border-t border-zinc-200/90 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-red-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:text-sm dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-offset-zinc-950"
        >
          {pending ? "Submitting…" : "Submit request"}
        </button>
        <p className="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          By submitting, you confirm this need is real and accurate to the best of your knowledge.
        </p>
      </div>
    </form>
  );
}
