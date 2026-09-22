"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  adminCheckInBabbfRegistrationAction,
  adminCheckOutBabbfRegistrationAction,
} from "@/actions/babbf-registration";

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function BabbfCheckInControls({
  referenceNumber,
  checkedInAt,
  checkedInVia,
}: {
  referenceNumber: string;
  checkedInAt: string;
  checkedInVia: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function checkIn() {
    setError(null);
    startTransition(async () => {
      const res = await adminCheckInBabbfRegistrationAction(referenceNumber);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function checkOut() {
    setError(null);
    startTransition(async () => {
      const res = await adminCheckOutBabbfRegistrationAction(referenceNumber);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Event check-in</p>
          {checkedInAt ? (
            <p className="mt-0.5 text-sm text-emerald-600">
              ✓ Checked in at {formatTimestamp(checkedInAt)}
              {checkedInVia ? ` via ${checkedInVia}` : ""}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">Not checked in</p>
          )}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={checkedInAt ? checkOut : checkIn}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
            checkedInAt
              ? "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
              : "bg-brand-red text-white hover:bg-brand-red/90"
          }`}
        >
          {pending ? "Saving…" : checkedInAt ? "Check out" : "Check in"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
