"use client";

import { useActionState } from "react";
import {
  bloodHeroAdminSignIn,
  type BloodHeroAdminAuthState,
} from "@/actions/bloodhero-admin-auth";

const initial: BloodHeroAdminAuthState = {};

export function BloodHeroAdminLoginForm({
  redirectTo,
}: {
  redirectTo: string;
}) {
  const [state, formAction, pending] = useActionState(bloodHeroAdminSignIn, initial);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirect" value={redirectTo} />
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-100"
        >
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="bh-admin-email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email
        </label>
        <input
          id="bh-admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label
          htmlFor="bh-admin-password"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Password
        </label>
        <input
          id="bh-admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          disabled={pending}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-red-700 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-800 disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600"
      >
        {pending ? "Signing in…" : "Sign in to BloodHero admin"}
      </button>
    </form>
  );
}
