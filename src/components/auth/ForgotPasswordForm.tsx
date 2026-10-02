"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

const initial: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initial);

  if (state?.success) {
    return (
      <p className="text-small text-[color:var(--color-text-muted)]">
        If an account exists for that email, a password reset link has been sent.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="ds-label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="ds-input" />
      </div>
      <Button type="submit" variant="primary" className="w-full" loading={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
