"use client";

import { useActionState } from "react";
import {
  type DonorAutoApprovalState,
  updateDonorAutoApproval,
} from "@/actions/bloodhero-admin-donors";

const initialState: DonorAutoApprovalState = {};

export function BloodHeroDonorAutoApprovalToggle({
  enabled,
  disabled = false,
}: {
  enabled: boolean;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(updateDonorAutoApproval, initialState);
  const nextEnabled = !enabled;
  const statusText = enabled ? "Auto approval ON" : "Auto approval OFF";
  const statusClass = enabled
    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
    : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <section className="mt-6 rounded-xl border border-red-200/70 bg-gradient-to-r from-red-50/70 to-white p-4 shadow-sm dark:border-red-900/40 dark:from-red-950/20 dark:to-zinc-900/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-800 dark:text-zinc-100">
            Donor auto approval
          </h2>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${statusClass}`}
            >
              {statusText}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            When enabled, new donor registrations are approved immediately. When disabled, donors stay
            pending until an admin reviews them.
          </p>
          {state?.error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
        </div>
        <form action={action}>
          <input type="hidden" name="enabled" value={String(nextEnabled)} />
          <button
            type="submit"
            disabled={pending || disabled}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {pending
              ? "Saving..."
              : disabled
                ? "Auto approval unavailable"
                : nextEnabled
                  ? "Enable auto approval"
                  : "Disable auto approval"}
          </button>
        </form>
      </div>
    </section>
  );
}
