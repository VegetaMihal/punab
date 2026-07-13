"use client";

import { useActionState } from "react";
import {
  checkInJulyAwardTicket,
  type CheckInState,
  type TicketLookupResult,
} from "@/actions/july-award-ticket-verify";
import { Button } from "@/components/ui/Button";

type Props = {
  ticketId: string;
  initial: TicketLookupResult | null;
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

export function JulyAwardTicketVerifyPanel({ ticketId, initial }: Props) {
  const [state, formAction, pending] = useActionState(checkInJulyAwardTicket, initialCheckIn);

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
          No registration matches <span className="font-mono">{ticketId}</span>.
        </p>
      </div>
    );
  }

  const checkedInAt = state?.checkedInAt ?? initial.checkedInAt;
  const checkedInVia = state?.checkedInVia ?? initial.checkedInVia;

  return (
    <div className="space-y-4">
      <div
        className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))] px-4 py-4"
        role="status"
      >
        <p className="text-base font-semibold text-[color:var(--color-success)]">Valid ticket</p>
        <p className="mt-1 font-mono text-small text-[color:var(--color-text-muted)]">{initial.ticketId}</p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-small">
        <dt className="text-[color:var(--color-text-muted)]">Name</dt>
        <dd className="font-medium text-[color:var(--color-text)]">{initial.fullName}</dd>
        <dt className="text-[color:var(--color-text-muted)]">University</dt>
        <dd className="text-[color:var(--color-text)]">{initial.universityName}</dd>
        <dt className="text-[color:var(--color-text-muted)]">Club</dt>
        <dd className="text-[color:var(--color-text)]">{initial.clubName || "—"}</dd>
        <dt className="text-[color:var(--color-text-muted)]">Phone</dt>
        <dd className="text-[color:var(--color-text)]">{initial.phoneNumber}</dd>
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
        <p className="text-small font-medium text-[color:var(--color-success)]">
          Checked in at {formatTimestamp(checkedInAt)}
          {checkedInVia ? ` via ${checkedInVia}` : ""}
        </p>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="ticketId" value={initial.ticketId} />
          <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto">
            {pending ? "Checking in…" : "Check in"}
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
