"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import {
  lookupBloodHeroTracker,
  type BloodHeroTrackerActionState,
} from "@/actions/bloodhero-tracker";
import type {
  BloodHeroTrackerEventRow,
  BloodHeroTrackerRequestRow,
} from "@/lib/bloodhero/tracker-types";
import { BloodHeroRequestTimeline } from "@/components/bloodhero/BloodHeroRequestTimeline";

const initial: BloodHeroTrackerActionState = {};

const labelClass = "block text-sm font-semibold text-(--bh-ink) ";

const controlClass =
  "mt-2 w-full min-h-[2.75rem] rounded-xl border border-(--bh-line) bg-(--bh-panel) px-3.5 py-2.5 font-mono text-base uppercase tracking-wide text-(--bh-ink) placeholder:normal-case placeholder:tracking-normal placeholder:text-(--bh-ink-soft) focus:border-(--bh-blood) focus:outline-none focus:ring-2 focus:ring-(--bh-blood) sm:min-h-0 sm:text-sm ";

const errClass = "mt-1.5 text-sm font-medium text-(--bh-blood-deep) ";

function statusBadgeClass(status: string) {
  switch (status) {
    case "fulfilled":
      return "border border-(--bh-success-border) bg-(--bh-success-bg) text-(--bh-success-ink)";
    case "matching":
      return "border border-(--bh-warn-border) bg-(--bh-warn-bg) text-(--bh-warn-ink)";
    case "cancelled":
      return "border border-(--bh-line) bg-(--bh-panel) text-(--bh-ink) ";
    default:
      return "border border-(--bh-blood-tint) bg-(--bh-blood-tint) text-(--bh-blood-deep) ";
  }
}

function statusAccentClass(status: string) {
  switch (status) {
    case "fulfilled":
      return "border-(--bh-success-accent)";
    case "matching":
      return "border-(--bh-warn-accent)";
    case "cancelled":
      return "border-(--bh-line)";
    default:
      return "border-(--bh-blood)";
  }
}

function statusHeadline(status: string) {
  switch (status) {
    case "fulfilled":
      return "Fulfilled";
    case "matching":
      return "Matching";
    case "cancelled":
      return "Closed";
    default:
      return "Open";
  }
}

function statusHint(status: string) {
  switch (status) {
    case "fulfilled":
      return "This request has been met.";
    case "matching":
      return "Coordinators are working to find donors.";
    case "cancelled":
      return "This request is no longer active.";
    default:
      return "Your request is on file and being reviewed.";
  }
}

export function BloodHeroTrackerPanel() {
  const [state, formAction] = useActionState(lookupBloodHeroTracker, initial);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(fd);
    });
  }

  const trackingError = state.fieldErrors?.tracking_number;
  const data = state.data;
  const pending = isPending;

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="rounded-2xl border border-(--bh-line) bg-(--bh-panel) px-4 py-4 sm:px-5">
        <p className="text-sm font-semibold text-(--bh-ink) ">Look up by tracking number</p>
        <p className="mt-2 text-sm leading-relaxed text-(--bh-ink-soft) ">
          Enter the tracking number shown after you submitted your blood request (for example{" "}
          <span className="font-mono text-(--bh-ink) ">BH-2026-000001</span>). One number
          matches one request—we never show unrelated cases.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {state.error ? (
          <div
            className="rounded-xl border border-(--bh-blood-tint) bg-(--bh-blood-tint) px-4 py-3.5 text-sm text-(--bh-blood-deep) "
            role="alert"
            aria-live="assertive"
          >
            {state.error}
          </div>
        ) : null}

        <div>
          <label htmlFor="tracker-tracking-number" className={labelClass}>
            Tracking number
          </label>
          <input
            id="tracker-tracking-number"
            name="tracking_number"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            required
            className={controlClass}
            placeholder="BH-2026-000123"
            aria-invalid={trackingError ? true : undefined}
            aria-describedby={
              trackingError ? "err-tracker-tracking-number" : "hint-tracker-tracking-number"
            }
          />
          {trackingError ? (
            <p id="err-tracker-tracking-number" className={errClass}>
              {trackingError}
            </p>
          ) : (
            <p id="hint-tracker-tracking-number" className="mt-1.5 text-xs text-(--bh-ink-soft) ">
              Spaces are optional. Letters are not case-sensitive.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl bg-(--bh-blood) px-6 text-sm font-semibold text-(--bh-on-blood) transition duration-150 hover:bg-(--bh-blood-deep) focus-visible:outline focus-visible:ring-2 focus-visible:ring-(--bh-blood) focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100 sm:w-auto sm:min-h-11"
        >
          {pending ? "Looking up…" : "Show request status"}
        </button>
      </form>

      {data ? (
        <div className="bh-rise-in space-y-6 border-t border-(--bh-line) pt-8 sm:space-y-8">
          {!data.request ? (
            <div
              className="rounded-2xl border border-(--bh-warn-border) bg-(--bh-warn-bg) px-4 py-3.5 text-sm leading-relaxed text-(--bh-warn-ink) sm:px-5 sm:py-4"
              role="status"
            >
              <span className="font-semibold text-(--bh-warn-ink)">No request found</span>
              <span className="mt-1 block text-(--bh-warn-body)">
                for <span className="font-mono font-medium">{data.trackingNumberUsed}</span>. Check the number
                from your confirmation screen, or submit a new request if needed.
              </span>
            </div>
          ) : (
            <TrackerRequestCard request={data.request} events={data.events} />
          )}
        </div>
      ) : null}
    </div>
  );
}

function TrackerRequestCard({
  request: r,
  events,
}: {
  request: BloodHeroTrackerRequestRow;
  events: BloodHeroTrackerEventRow[];
}) {
  const headline = statusHeadline(r.status);
  const hint = statusHint(r.status);

  return (
    <article
      className={`overflow-hidden rounded-2xl border-2 bg-(--bh-panel) ${statusAccentClass(r.status)}`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-(--bh-line) pb-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              Tracking number
            </p>
            <p className="mt-1.5 break-all font-mono text-xl font-bold tracking-tight text-(--bh-ink) sm:text-2xl">
              {r.tracking_number}
            </p>
            <p className="mt-1 max-w-prose text-xs leading-snug text-(--bh-ink-soft) ">
              Use this code on this page anytime, or quote it if you contact BloodHero.
            </p>
          </div>
          <div className="flex w-full flex-col gap-1.5 rounded-xl bg-(--bh-panel) px-3.5 py-3 sm:max-w-[min(100%,14rem)] sm:shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              Current status
            </p>
            <span
              className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-bold transition-colors duration-300 sm:py-2.5 ${statusBadgeClass(r.status)}`}
              aria-label={`Request status: ${headline}`}
            >
              {headline}
            </span>
            <p className="text-xs leading-snug text-(--bh-ink-soft) ">{hint}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-1">
          <div className="border-b border-(--bh-line) py-3.5 first:pt-0 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              Patient
            </dt>
            <dd className="mt-1 text-base font-semibold leading-snug text-(--bh-ink) ">
              {r.patient_name}
            </dd>
          </div>
          <div className="border-b border-(--bh-line) py-3.5 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              Blood group
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-(--bh-ink) ">
              {r.blood_group}
            </dd>
          </div>
          <div className="border-b border-(--bh-line) py-3.5 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              District
            </dt>
            <dd className="mt-1 break-words text-base leading-snug text-(--bh-ink) ">
              {r.district}
            </dd>
          </div>
          <div className="border-b border-(--bh-line) py-3.5 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              Donation location
            </dt>
            <dd className="mt-1 break-words text-base leading-snug text-(--bh-ink) ">
              {r.donation_location}
            </dd>
          </div>
          <div className="border-b border-(--bh-line) py-3.5 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              When needed
            </dt>
            <dd className="mt-1 text-base leading-snug tabular-nums text-(--bh-ink) ">
              {new Date(r.planned_donation_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
          <div className="border-b border-(--bh-line) py-3.5 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              Units requested
            </dt>
            <dd className="mt-1 text-base tabular-nums text-(--bh-ink) ">{r.request_quantity}</dd>
          </div>
          <div className="border-b border-(--bh-line) py-3.5 last:border-b-0 sm:col-span-2 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
              Submitted
            </dt>
            <dd className="mt-1 flex flex-col gap-1 text-base leading-snug text-(--bh-ink) sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
              <time dateTime={r.created_at}>
                {new Date(r.created_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
              <span className="hidden text-(--bh-ink-soft) sm:inline" aria-hidden>
                ·
              </span>
              <span className="text-sm text-(--bh-ink-soft) ">Requester: {r.requester_name}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-(--bh-line) bg-(--bh-panel) px-4 py-5 sm:px-6 sm:py-6">
        <h3 className="text-base font-bold text-(--bh-ink) ">What&apos;s happening</h3>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-(--bh-ink-soft) ">
          Step-by-step updates. More detail will appear here as matching and notifications go live.
        </p>
        <div className="mt-5">
          <BloodHeroRequestTimeline
            status={r.status}
            requestCreatedAt={r.created_at}
            events={events}
          />
        </div>
      </div>
    </article>
  );
}
