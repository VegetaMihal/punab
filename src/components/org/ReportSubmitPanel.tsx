"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { reopenReportAction, submitReportAction, type OrgActionState } from "@/actions/org";
import { Button } from "@/components/ui/Button";

const initial: OrgActionState = {};

export function ReportSubmitPanel({ reportId, status }: { reportId: string; status: string }) {
  const router = useRouter();
  const [submitPending, startSubmit] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reopenState, reopenAction, reopenPending] = useActionState(reopenReportAction, initial);
  const [showReopen, setShowReopen] = useState(false);

  const canSubmit = status === "draft" || status === "reopened";
  const canReopen = status === "submitted" || status === "late_submitted" || status === "resubmitted";

  function submit() {
    setSubmitError(null);
    startSubmit(async () => {
      const result = await submitReportAction(reportId);
      if (result?.error) setSubmitError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="rounded-md border border-stone-200 p-4 dark:border-stone-800">
      {submitError && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <p className="mb-1 font-medium">Can&apos;t submit yet:</p>
          <p>{submitError}</p>
        </div>
      )}
      {canSubmit && (
        <div>
          <Button type="button" variant="primary" size="sm" loading={submitPending} onClick={submit}>
            {status === "reopened" ? "Send corrected report" : "Submit this report"}
          </Button>
          <p className="ds-helper mt-1">Once submitted, you can&apos;t edit it unless Central Management reopens it.</p>
        </div>
      )}
      {canReopen && !showReopen && (
        <div>
          <p className="mb-2 text-sm text-muted">This report has been submitted and is locked for editing.</p>
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowReopen(true)}>
            Reopen it to fix something
          </Button>
        </div>
      )}
      {showReopen && (
        <form action={reopenAction} className="mt-2 flex flex-wrap items-end gap-2">
          <input type="hidden" name="reportId" value={reportId} />
          {reopenState?.error && <p className="w-full text-xs text-red-700 dark:text-red-300">{reopenState.error}</p>}
          <div className="flex-1">
            <label htmlFor="reason" className="ds-label">Why are you reopening it?</label>
            <input id="reason" name="reason" type="text" required minLength={3} className="ds-input" placeholder="e.g. wrong attendance for one activity" />
          </div>
          <Button type="submit" variant="secondary" size="sm" loading={reopenPending}>
            Reopen
          </Button>
        </form>
      )}
      {!canSubmit && !canReopen && (
        <p className="text-sm text-muted">This report is locked and can&apos;t be changed right now.</p>
      )}
    </div>
  );
}
