"use client";

import { useActionState } from "react";
import {
  rerunBloodHeroMatchingForAdmin,
  type RerunBloodHeroMatchingState,
} from "@/actions/bloodhero-admin-requests";

const initial: RerunBloodHeroMatchingState = {};

export function BloodHeroAdminRerunMatchingAction({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(rerunBloodHeroMatchingForAdmin, initial);

  return (
    <div className="mt-3">
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="requestId" value={requestId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {pending ? "Re-running..." : "Re-run donor matching"}
        </button>
      </form>
      {state.success && (
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
          Matching complete. Selected: {state.inserted ?? 0}, emails sent: {state.sent ?? 0}.
        </p>
      )}
      {state.error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </div>
  );
}
