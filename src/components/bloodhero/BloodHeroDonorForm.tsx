"use client";

import {
  useActionState,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  registerBloodHeroDonor,
  type BloodHeroDonorActionState,
} from "@/actions/bloodhero-donor";
import {
  BLOOD_HERO_BLOOD_GROUPS,
  bloodHeroDonorFieldErrors,
  bloodHeroDonorFormSchema,
  parseBloodHeroDonorFormData,
} from "@/lib/validations/bloodhero-donor";

const initial: BloodHeroDonorActionState = {};

const sectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400";

const labelClass = "block text-sm font-semibold text-zinc-800 dark:text-zinc-100";

const req = (
  <span className="text-red-600 dark:text-red-400" aria-hidden>
    *
  </span>
);

/** Shared control styles — comfortable tap targets on small screens */
const controlClass =
  "mt-2 w-full min-h-[2.75rem] rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:min-h-0 sm:text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const hintClass = "mt-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400";

const errClass = "mt-1.5 text-sm font-medium text-red-600 dark:text-red-400";

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

export function BloodHeroDonorForm() {
  const [state, formAction] = useActionState(registerBloodHeroDonor, initial);
  const [isPending, startTransition] = useTransition();
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const fieldErrors = mergeFieldErrors(state.fieldErrors, clientErrors);
  const pending = isPending;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = bloodHeroDonorFormSchema.safeParse(parseBloodHeroDonorFormData(fd));
    if (!parsed.success) {
      setClientErrors(bloodHeroDonorFieldErrors(parsed.error));
      return;
    }
    setClientErrors({});
    startTransition(() => {
      formAction(fd);
    });
  }

  if (state.success) {
    return (
      <div
        className="rounded-2xl border border-emerald-200/90 bg-emerald-50/95 px-5 py-8 text-center sm:px-8 dark:border-emerald-900/45 dark:bg-emerald-950/40"
        role="status"
      >
        <p className="text-lg font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">
          Thank you — we received your details
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
          Your registration is <strong>pending review</strong>. We&apos;ll verify your information
          before matching you to requests, and we&apos;ll only use the email or phone you gave for
          coordination.
        </p>
        <p className="mx-auto mt-5 max-w-sm text-xs leading-relaxed text-emerald-800/85 dark:text-emerald-200/75">
          No account needed. To update details later, reach out via the main PUNAB site.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10" noValidate>
      <p className="rounded-xl border border-red-100/80 bg-red-50/40 px-4 py-3 text-sm leading-snug text-zinc-700 dark:border-red-950/30 dark:bg-red-950/15 dark:text-zinc-300">
        Takes about two minutes. Your information is used only for BloodHero coordination and admin
        review.
      </p>

      {state.error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-snug text-red-900 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-100"
          role="alert"
          aria-live="assertive"
        >
          {state.error}
        </div>
      ) : null}

      {/* Contact */}
      <section className="space-y-5" aria-labelledby="donor-h-contact">
        <h2 id="donor-h-contact" className={sectionTitleClass}>
          How we reach you
        </h2>
        <div className="space-y-5 sm:space-y-4">
          <div>
            <label htmlFor="full_name" className={labelClass}>
              Full name {req}
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              className={controlClass}
              placeholder="Name for coordinators"
              aria-invalid={fieldErrors.full_name ? "true" : undefined}
              aria-describedby={fieldErrors.full_name ? "err-full_name" : undefined}
            />
            {fieldErrors.full_name ? (
              <p id="err-full_name" className={errClass}>
                {fieldErrors.full_name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email {req}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                className={controlClass}
                placeholder="you@example.com"
                aria-invalid={fieldErrors.email ? "true" : undefined}
                aria-describedby={
                  fieldErrors.email ? "err-email" : "hint-email"
                }
              />
              {fieldErrors.email ? (
                <p id="err-email" className={errClass}>
                  {fieldErrors.email}
                </p>
              ) : (
                <FieldHint id="hint-email">Coordination only. One registration per email.</FieldHint>
              )}
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone {req}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                className={controlClass}
                placeholder="Number you answer urgently"
                aria-invalid={fieldErrors.phone ? "true" : undefined}
                aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
              />
              {fieldErrors.phone ? (
                <p id="err-phone" className={errClass}>
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-zinc-200/90 dark:bg-zinc-800" aria-hidden />

      {/* Blood & location */}
      <section className="space-y-5" aria-labelledby="donor-h-clinical">
        <h2 id="donor-h-clinical" className={sectionTitleClass}>
          Blood group & donation point
        </h2>
        <div className="space-y-5 sm:space-y-4">
          <div>
            <label htmlFor="blood_group" className={labelClass}>
              Blood group {req}
            </label>
            <select
              id="blood_group"
              name="blood_group"
              required
              defaultValue=""
              className={controlClass}
              aria-invalid={fieldErrors.blood_group ? "true" : undefined}
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
          <div>
            <label htmlFor="center_point_address" className={labelClass}>
              Center donation point address {req}
            </label>
            <input
              id="center_point_address"
              name="center_point_address"
              type="text"
              autoComplete="street-address"
              required
              className={controlClass}
              placeholder="Hospital/campus/area where you can donate from"
              aria-invalid={fieldErrors.center_point_address ? "true" : undefined}
              aria-describedby={
                fieldErrors.center_point_address ? "err-center_point_address" : "hint-center_point_address"
              }
            />
            {fieldErrors.center_point_address ? (
              <p id="err-center_point_address" className={errClass}>
                {fieldErrors.center_point_address}
              </p>
            ) : (
              <FieldHint id="hint-center_point_address">Used for nearest-donor matching.</FieldHint>
            )}
          </div>
          <div>
            <label htmlFor="district_or_area" className={labelClass}>
              District / area label <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <input
              id="district_or_area"
              name="district_or_area"
              type="text"
              autoComplete="address-level2"
              className={controlClass}
              placeholder="e.g. Dhaka"
            />
            <FieldHint>Optional helper label for admin filtering.</FieldHint>
          </div>
        </div>
      </section>

      <div className="h-px bg-zinc-200/90 dark:bg-zinc-800" aria-hidden />

      {/* Availability */}
      <fieldset
        className="space-y-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-5 sm:p-6 dark:border-zinc-700 dark:bg-zinc-900/35"
        aria-labelledby="donor-avail-title"
      >
        <legend className="sr-only">Availability — at least one option required</legend>
        <div id="donor-avail-title">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            Availability {req}
          </p>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pick at least one: available now, or your last donation date.
          </p>
        </div>
        {fieldErrors.availability ? (
          <p id="err-availability" className={errClass}>
            {fieldErrors.availability}
          </p>
        ) : null}
        <div className="space-y-5 pt-1">
          <label className="flex cursor-pointer gap-3.5 rounded-xl border border-transparent px-1 py-1 transition-colors hover:border-zinc-200/80 hover:bg-white/60 dark:hover:border-zinc-600 dark:hover:bg-zinc-950/40">
            <input
              type="checkbox"
              name="available_now"
              className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded border-zinc-300 text-red-600 focus:ring-2 focus:ring-red-500/30 dark:border-zinc-600"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                I&apos;m available to donate now
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                Eligible and able to respond to urgent calls nearby.
              </span>
            </span>
          </label>
          <div className="border-t border-zinc-200/80 pt-5 dark:border-zinc-700/80">
            <label htmlFor="last_donated_date" className={labelClass}>
              Last donation date
            </label>
            <input
              id="last_donated_date"
              name="last_donated_date"
              type="date"
              className={`${controlClass} max-w-full sm:max-w-[12rem]`}
              aria-invalid={fieldErrors.last_donated_date ? "true" : undefined}
              aria-describedby={fieldErrors.last_donated_date ? "err-last_donated_date" : undefined}
            />
            {fieldErrors.last_donated_date ? (
              <p id="err-last_donated_date" className={errClass}>
                {fieldErrors.last_donated_date}
              </p>
            ) : (
              <FieldHint>Optional if you checked &quot;available now&quot; above.</FieldHint>
            )}
          </div>
        </div>
      </fieldset>

      <div className="space-y-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-red-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:text-sm dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-offset-zinc-950"
        >
          {pending ? "Submitting…" : "Submit registration"}
        </button>
        <p className="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          By submitting, you confirm your details are accurate. Review is required before matching.
        </p>
      </div>
    </form>
  );
}
