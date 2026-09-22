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
import { BloodHeroLocationPicker } from "@/components/bloodhero/BloodHeroLocationPicker";

const initial: BloodHeroDonorActionState = {};

const sectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-(--bh-ink-soft) ";

const labelClass = "block text-sm font-semibold text-(--bh-ink) ";

const req = (
  <span className="text-(--bh-blood-deep) " aria-hidden>
    *
  </span>
);

/** Shared control styles — comfortable tap targets on small screens */
const controlClass =
  "mt-2 w-full min-h-[2.75rem] rounded-xl border border-(--bh-line) bg-(--bh-panel) px-3.5 py-2.5 text-base text-(--bh-ink) placeholder:text-(--bh-ink-soft) focus:border-(--bh-blood) focus:outline-none focus:ring-2 focus:ring-(--bh-blood) sm:min-h-0 sm:text-sm ";

const hintClass = "mt-1.5 text-xs leading-snug text-(--bh-ink-soft) ";

const errClass = "mt-1.5 text-sm font-medium text-(--bh-blood-deep) ";

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
        className="bh-rise-in rounded-2xl border border-(--bh-success-border) bg-(--bh-success-bg) px-5 py-8 text-center sm:px-8"
        role="status"
      >
        <p className="text-lg font-semibold tracking-tight text-(--bh-success-ink)">
          Thank you — we received your details
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-(--bh-success-body)">
          Your registration is <strong>pending review</strong>. We&apos;ll verify your information
          before matching you to requests, and we&apos;ll only use the email or phone you gave for
          coordination.
        </p>
        <p className="mx-auto mt-5 max-w-sm text-xs leading-relaxed text-(--bh-success-body)">
          No account needed. To update details later, reach out via the main PUNAB site.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10" noValidate>
      <p className="rounded-xl border border-(--bh-blood-tint) bg-(--bh-blood-tint) px-4 py-3 text-sm leading-snug text-(--bh-ink-soft) ">
        Takes about two minutes. Your information is used only for BloodHero coordination and admin
        review.
      </p>

      {state.error ? (
        <div
          className="rounded-xl border border-(--bh-blood-tint) bg-(--bh-blood-tint) px-4 py-3.5 text-sm leading-snug text-(--bh-blood-deep) "
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

      <div className="h-px bg-(--bh-panel) " aria-hidden />

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
          <BloodHeroLocationPicker
            addressFieldId="center_point_address"
            addressName="center_point_address"
            latName="center_point_lat"
            lngName="center_point_lng"
            addressLabel="Center donation point address"
            addressPlaceholder="Hospital/campus/area where you can donate from"
            addressRequired
            hint="Used for nearest-donor matching."
            fieldError={fieldErrors.center_point_address}
          />
          <div>
            <label htmlFor="district_or_area" className={labelClass}>
              District / area label <span className="font-normal text-(--bh-ink-soft)">(optional)</span>
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

      <div className="h-px bg-(--bh-panel) " aria-hidden />

      {/* Availability */}
      <fieldset
        className="space-y-4 rounded-2xl border border-(--bh-line) bg-(--bh-panel) p-5 sm:p-6 "
        aria-labelledby="donor-avail-title"
      >
        <legend className="sr-only">Availability — at least one option required</legend>
        <div id="donor-avail-title">
          <p className="text-sm font-semibold text-(--bh-ink) ">
            Availability {req}
          </p>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-(--bh-ink-soft) ">
            Pick at least one: available now, or your last donation date.
          </p>
        </div>
        {fieldErrors.availability ? (
          <p id="err-availability" className={errClass}>
            {fieldErrors.availability}
          </p>
        ) : null}
        <div className="space-y-5 pt-1">
          <label className="flex cursor-pointer gap-3.5 rounded-xl border border-transparent px-1 py-1 transition-colors hover:border-(--bh-line) hover:bg-(--bh-panel) ">
            <input
              type="checkbox"
              name="available_now"
              className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded border-(--bh-line) text-(--bh-blood-deep) focus:ring-2 focus:ring-(--bh-blood) "
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-(--bh-ink) ">
                I&apos;m available to donate now
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-(--bh-ink-soft) ">
                Eligible and able to respond to urgent calls nearby.
              </span>
            </span>
          </label>
          <div className="border-t border-(--bh-line) pt-5 ">
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
          className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-(--bh-blood) px-6 text-base font-semibold text-(--bh-on-blood) transition duration-150 hover:bg-(--bh-blood-deep) focus-visible:outline focus-visible:ring-2 focus-visible:ring-(--bh-blood) focus-visible:ring-offset-2 active:scale-[0.98] active:bg-(--bh-blood-deep) disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100 sm:min-h-12 sm:text-sm "
        >
          {pending ? "Submitting…" : "Submit registration"}
        </button>
        <p className="text-center text-xs leading-relaxed text-(--bh-ink-soft) ">
          By submitting, you confirm your details are accurate. Review is required before matching.
        </p>
      </div>
    </form>
  );
}
