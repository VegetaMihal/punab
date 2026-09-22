"use client";

import { useActionState } from "react";
import { checkInBabbfTicket, type BabbfTicketLookupResult, type CheckInState } from "@/actions/babbf-ticket-verify";
import { Button } from "@/components/ui/Button";

type Props = {
  referenceNumber: string;
  initial: BabbfTicketLookupResult | null;
};

const initialCheckIn: CheckInState = {};

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

export function BabbfTicketVerifyPanel({ referenceNumber, initial }: Props) {
  const [state, formAction, pending] = useActionState(checkInBabbfTicket, initialCheckIn);

  if (!initial || !initial.ok) {
    return (
      <p className="text-small font-medium text-[color:var(--color-error)]" role="alert">
        Could not look up this ticket: {initial?.error ?? "unknown error"}
      </p>
    );
  }

  if (!initial.found) {
    return (
      <div
        className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-4 py-4"
        role="alert"
      >
        <p className="text-base font-semibold text-[color:var(--color-error)]">Ticket not found</p>
        <p className="mt-1 text-small text-[color:var(--color-text-muted)]">
          No registration matches <span className="font-mono">{referenceNumber}</span>.
        </p>
      </div>
    );
  }

  const checkedInAt = state?.checkedInAt ?? initial.checkedInAt;
  const notConfirmed = initial.status !== "Confirmed";

  return (
    <div className="space-y-4">
      <div
        className={`rounded-[var(--radius-md)] border px-4 py-4 ${
          notConfirmed
            ? "border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))]"
            : "border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))]"
        }`}
        role="status"
      >
        <p className={`text-base font-semibold ${notConfirmed ? "text-[color:var(--color-error)]" : "text-[color:var(--color-success)]"}`}>
          {notConfirmed ? `Not confirmed — status: ${initial.status || "New"}` : "Valid, confirmed ticket"}
        </p>
        <p className="mt-1 font-mono text-small text-[color:var(--color-text-muted)]">{initial.referenceNumber}</p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-small">
        <dt className="text-[color:var(--color-text-muted)]">Name</dt>
        <dd className="font-medium text-[color:var(--color-text)]">{initial.fullName}</dd>
        <dt className="text-[color:var(--color-text-muted)]">Event</dt>
        <dd className="text-[color:var(--color-text)]">{initial.eventTypeLabel}</dd>
        <dt className="text-[color:var(--color-text-muted)]">Institution</dt>
        <dd className="text-[color:var(--color-text)]">{initial.universityName}</dd>
        <dt className="text-[color:var(--color-text-muted)]">Category</dt>
        <dd className="text-[color:var(--color-text)]">{initial.category}</dd>
      </dl>

      {initial.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={initial.photoUrl}
          alt={initial.fullName}
          className="h-32 w-32 rounded-[var(--radius-md)] object-cover"
        />
      )}

      {checkedInAt ? (
        <p className="text-small font-medium text-[color:var(--color-success)]">Checked in at {formatTimestamp(checkedInAt)}</p>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="referenceNumber" value={initial.referenceNumber} />
          <Button type="submit" variant="primary" loading={pending} disabled={notConfirmed} className="w-full sm:w-auto">
            {pending ? "Checking in…" : notConfirmed ? "Cannot check in — not confirmed" : "Check in"}
          </Button>
        </form>
      )}

      {state?.error && (
        <p className="text-small font-medium text-[color:var(--color-error)]" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
