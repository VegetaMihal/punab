"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/actions/contact";
import { Button } from "@/components/ui/Button";

const initial: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-5">
      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-success)]"
          role="status"
        >
          Thank you — your message has been received.
        </div>
      )}
      <div>
        <label htmlFor="name" className="ds-label">
          Name
        </label>
        <input id="name" name="name" required className="ds-input" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email" className="ds-label">
          Email
        </label>
        <input id="email" name="email" type="email" required className="ds-input" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="message" className="ds-label">
          Message
        </label>
        <textarea id="message" name="message" required rows={5} className="ds-textarea" />
      </div>
      <Button type="submit" variant="primary" loading={pending} className="w-full">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
