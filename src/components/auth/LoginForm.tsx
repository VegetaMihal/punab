"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

const initial: AuthActionState = {};

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirect" value={redirectTo} />
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
      <div>
        <label htmlFor="password" className="ds-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="ds-input"
        />
      </div>
      <Button type="submit" variant="primary" className="w-full" loading={pending}>
        {pending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}
