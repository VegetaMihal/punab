"use client";

import { useActionState } from "react";
import {
  bloodHeroAdminReviewDonor,
  type ReviewDonorState,
} from "@/actions/bloodhero-admin-donors";

const initial: ReviewDonorState = {};

export function BloodHeroPendingDonorRowActions({ donorId }: { donorId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(
    bloodHeroAdminReviewDonor,
    initial
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    bloodHeroAdminReviewDonor,
    initial
  );

  const err = approveState?.error ?? rejectState?.error;
  const busy = approvePending || rejectPending;

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
      {err && (
        <span className="max-w-[14rem] text-right text-xs text-red-600 dark:text-red-400">{err}</span>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <form action={approveAction}>
          <input type="hidden" name="donorId" value={donorId} />
          <input type="hidden" name="decision" value="approve" />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {approvePending ? "…" : "Approve"}
          </button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="donorId" value={donorId} />
          <input type="hidden" name="decision" value="reject" />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {rejectPending ? "…" : "Reject"}
          </button>
        </form>
      </div>
    </div>
  );
}
