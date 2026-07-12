"use client";

import { useActionState } from "react";
import {
  type UpdateBloodHeroRequestStatusState,
  updateBloodHeroRequestStatus,
} from "@/actions/bloodhero-admin-requests";

const initial: UpdateBloodHeroRequestStatusState = {};
const statuses = ["open", "matching", "fulfilled", "closed"] as const;

export function BloodHeroAdminRequestStatusActions({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: "open" | "matching" | "fulfilled" | "cancelled";
}) {
  const [state, action, pending] = useActionState(updateBloodHeroRequestStatus, initial);
  const currentUiStatus = currentStatus === "cancelled" ? "closed" : currentStatus;

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="requestId" value={requestId} />
        <select
          name="status"
          defaultValue={currentUiStatus}
          disabled={pending}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {pending ? "Saving..." : "Update"}
        </button>
      </form>
      {state.error && <p className="max-w-[14rem] text-right text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </div>
  );
}
