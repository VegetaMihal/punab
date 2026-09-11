"use client";

import { useActionState } from "react";
import { approvePromotionAction, rejectPromotionAction, type PromotionActionState } from "@/actions/org-promotions";
import { Button } from "@/components/ui/Button";

const initial: PromotionActionState = {};

export function PromotionDecisionForm({ applicationId }: { applicationId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(approvePromotionAction, initial);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectPromotionAction, initial);

  return (
    <div className="flex flex-wrap items-start gap-3">
      <form action={approveAction} className="flex items-end gap-2">
        <input type="hidden" name="applicationId" value={applicationId} />
        <input type="text" name="notes" placeholder="Approval note" className="ds-input w-40" />
        <Button type="submit" variant="primary" size="sm" loading={approvePending}>
          Approve
        </Button>
      </form>
      <form action={rejectAction} className="flex items-end gap-2">
        <input type="hidden" name="applicationId" value={applicationId} />
        <input type="text" name="notes" placeholder="Rejection reason" className="ds-input w-40" />
        <Button type="submit" variant="secondary" size="sm" loading={rejectPending}>
          Reject
        </Button>
      </form>
      {approveState?.error && <p className="w-full text-xs text-red-700 dark:text-red-300">{approveState.error}</p>}
      {rejectState?.error && <p className="w-full text-xs text-red-700 dark:text-red-300">{rejectState.error}</p>}
    </div>
  );
}
