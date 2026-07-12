"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  submitJulyAwardVolunteerPasscode,
  type VolunteerPasscodeState,
} from "@/actions/july-award-ticket-verify";
import { Button } from "@/components/ui/Button";

const initial: VolunteerPasscodeState = {};

export function VolunteerPasscodeForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitJulyAwardVolunteerPasscode, initial);

  useEffect(() => {
    if (!state || state.error) return;
    router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-small text-[color:var(--color-text-muted)]">
        Volunteer access only. Enter the event passcode to verify tickets.
      </p>
      <input
        type="password"
        name="passcode"
        required
        autoFocus
        className="ds-input"
        placeholder="Passcode"
      />
      {state?.error && (
        <p className="text-small font-medium text-[color:var(--color-error)]" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" loading={pending}>
        {pending ? "Checking…" : "Unlock"}
      </Button>
    </form>
  );
}
