"use client";

import type { BloodHeroTrackerEventRow } from "@/lib/bloodhero/tracker-types";
import {
  eventTypeLabel,
  syntheticTimelineForStatus,
  type TrackerTimelineItem,
} from "@/lib/bloodhero/tracker-display";

function mergeTimeline(
  status: string,
  requestCreatedAt: string,
  dbEvents: BloodHeroTrackerEventRow[]
): TrackerTimelineItem[] {
  const sorted = [...dbEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sorted.length === 0) {
    return syntheticTimelineForStatus(status, requestCreatedAt);
  }

  const fromDb: TrackerTimelineItem[] = sorted.map((e, i) => ({
    key: e.id,
    title: eventTypeLabel(e.event_type),
    detail: e.event_message ?? "",
    at: e.created_at,
    variant: i === sorted.length - 1 ? "current" : "done",
  }));

  fromDb.push({
    key: "seed_next",
    title: "What is next",
    detail:
      "Further updates—donor matching, confirmations—will appear here as the program rolls out.",
    variant: "upcoming",
  });

  return fromDb;
}

export function BloodHeroRequestTimeline({
  status,
  requestCreatedAt,
  events,
}: {
  status: string;
  requestCreatedAt: string;
  events: BloodHeroTrackerEventRow[];
}) {
  const items = mergeTimeline(status, requestCreatedAt, events);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute left-[11px] top-3 bottom-3 w-0.5 -translate-x-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700 sm:top-4 sm:bottom-4"
        aria-hidden
      />
      <ol className="m-0 list-none p-0" aria-label="Request progress">
      {items.map((item) => {
        const isDone = item.variant === "done";
        const isCurrent = item.variant === "current";
        const ring =
          isDone
            ? "border-emerald-500 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
            : isCurrent
              ? "border-red-600 bg-red-600 shadow-[0_0_0_3px_rgba(220,38,38,0.2)] dark:border-red-500 dark:bg-red-500"
              : "border-zinc-300 bg-white dark:border-zinc-500 dark:bg-zinc-900";

        return (
          <li key={item.key} className="relative pb-5 last:pb-0 sm:pb-6">
            <div className="flex gap-3 sm:gap-4">
              <div className="relative z-[1] flex shrink-0 justify-center pt-1 sm:pt-1.5" style={{ width: "1.375rem" }}>
                <span
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white dark:border-zinc-950 ${ring}`}
                  aria-hidden
                />
              </div>
              <div
                className={`min-w-0 flex-1 rounded-xl border px-3.5 py-3 sm:px-4 sm:py-3.5 ${
                  isCurrent
                    ? "border-red-200/90 bg-white shadow-sm dark:border-red-900/40 dark:bg-zinc-900/80"
                    : isDone
                      ? "border-zinc-200/90 bg-white/90 dark:border-zinc-700 dark:bg-zinc-900/50"
                      : "border-dashed border-zinc-200/90 bg-white/60 dark:border-zinc-600 dark:bg-zinc-900/30"
                }`}
              >
                <p className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">{item.title}</p>
                {item.detail ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.detail}</p>
                ) : null}
                {item.at ? (
                  <p className="mt-2 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-500">
                    {new Date(item.at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
