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

const labelClass = "block text-sm font-semibold text-zinc-800 dark:text-zinc-100";

const controlClass =
  "mt-2 w-full min-h-[2.75rem] rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-base uppercase tracking-wide text-zinc-900 shadow-sm placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:min-h-0 sm:text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100";

const errClass = "mt-1.5 text-sm font-medium text-red-600 dark:text-red-400";

function statusBadgeClass(status: string) {
  switch (status) {
    case "fulfilled":
      return "border border-emerald-200/80 bg-emerald-100 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-50";
    case "matching":
      return "border border-amber-200/80 bg-amber-100 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/45 dark:text-amber-50";
    case "cancelled":
      return "border border-zinc-300/80 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100";
    default:
      return "border border-red-200/80 bg-red-100 text-red-950 dark:border-red-900/50 dark:bg-red-950/45 dark:text-red-50";
  }
}

function statusAccentClass(status: string) {
  switch (status) {
    case "fulfilled":
      return "border-l-emerald-500";
    case "matching":
      return "border-l-amber-500";
    case "cancelled":
      return "border-l-zinc-400 dark:border-l-zinc-500";
    default:
      return "border-l-red-500";
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
      <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/60 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 sm:px-5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Look up by tracking number</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Enter the tracking number shown after you submitted your blood request (for example{" "}
          <span className="font-mono text-zinc-800 dark:text-zinc-200">BH-2026-000001</span>). One number
          matches one request—we never show unrelated cases.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {state.error ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-100"
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
            <p id="hint-tracker-tracking-number" className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Spaces are optional. Letters are not case-sensitive.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-offset-zinc-950 sm:w-auto sm:min-h-11"
        >
          {pending ? "Looking up…" : "Show request status"}
        </button>
      </form>

      {data ? (
        <div className="space-y-6 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:space-y-8">
          {!data.request ? (
            <div
              className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3.5 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100 sm:px-5 sm:py-4"
              role="status"
            >
              <span className="font-semibold text-amber-900 dark:text-amber-50">No request found</span>
              <span className="mt-1 block text-amber-950/90 dark:text-amber-100/90">
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
      className={`overflow-hidden rounded-2xl border border-zinc-200/90 border-l-4 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 ${statusAccentClass(r.status)}`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800/80 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Tracking number
            </p>
            <p className="mt-1.5 break-all font-mono text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              {r.tracking_number}
            </p>
            <p className="mt-1 max-w-prose text-xs leading-snug text-zinc-500 dark:text-zinc-400">
              Use this code on this page anytime, or quote it if you contact BloodHero.
            </p>
          </div>
          <div className="flex w-full flex-col gap-1.5 rounded-xl bg-zinc-50/90 px-3.5 py-3 dark:bg-zinc-950/50 sm:max-w-[min(100%,14rem)] sm:shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Current status
            </p>
            <span
              className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-bold sm:py-2.5 ${statusBadgeClass(r.status)}`}
              aria-label={`Request status: ${headline}`}
            >
              {headline}
            </span>
            <p className="text-xs leading-snug text-zinc-600 dark:text-zinc-400">{hint}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-1">
          <div className="border-b border-zinc-100 py-3.5 first:pt-0 dark:border-zinc-800/80 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Patient
            </dt>
            <dd className="mt-1 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
              {r.patient_name}
            </dd>
          </div>
          <div className="border-b border-zinc-100 py-3.5 dark:border-zinc-800/80 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Blood group
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {r.blood_group}
            </dd>
          </div>
          <div className="border-b border-zinc-100 py-3.5 dark:border-zinc-800/80 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              District
            </dt>
            <dd className="mt-1 break-words text-base leading-snug text-zinc-800 dark:text-zinc-200">
              {r.district}
            </dd>
          </div>
          <div className="border-b border-zinc-100 py-3.5 dark:border-zinc-800/80 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Donation location
            </dt>
            <dd className="mt-1 break-words text-base leading-snug text-zinc-800 dark:text-zinc-200">
              {r.donation_location}
            </dd>
          </div>
          <div className="border-b border-zinc-100 py-3.5 dark:border-zinc-800/80 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              When needed
            </dt>
            <dd className="mt-1 text-base leading-snug tabular-nums text-zinc-800 dark:text-zinc-200">
              {new Date(r.planned_donation_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
          <div className="border-b border-zinc-100 py-3.5 dark:border-zinc-800/80 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Units requested
            </dt>
            <dd className="mt-1 text-base tabular-nums text-zinc-800 dark:text-zinc-200">{r.request_quantity}</dd>
          </div>
          <div className="border-b border-zinc-100 py-3.5 last:border-b-0 dark:border-zinc-800/80 sm:col-span-2 sm:border-0 sm:py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Submitted
            </dt>
            <dd className="mt-1 flex flex-col gap-1 text-base leading-snug text-zinc-800 dark:text-zinc-200 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
              <time dateTime={r.created_at}>
                {new Date(r.created_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
              <span className="hidden text-zinc-400 sm:inline" aria-hidden>
                ·
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Requester: {r.requester_name}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-5 dark:border-zinc-800/80 dark:bg-zinc-950/35 sm:px-6 sm:py-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">What&apos;s happening</h3>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
