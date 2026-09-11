"use client";

import { useActionState } from "react";
import { completeFirstLoginPasswordChange, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

const initial: AuthActionState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(completeFirstLoginPasswordChange, initial);

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
        <label htmlFor="password" className="ds-label">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="ds-input"
        />
        <p className="ds-helper">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="ds-label">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="ds-input"
        />
      </div>
      <Button type="submit" variant="primary" className="w-full" loading={pending}>
        {pending ? "Saving…" : "Set password and continue"}
      </Button>
    </form>
  );
}
