"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { assignReporterAction, revokeReporterAction, type OrgActionState } from "@/actions/org";
import { reporterTypeLabel } from "@/lib/org/labels";
import { Button } from "@/components/ui/Button";

const initial: OrgActionState = {};

export function ReporterPanel({
  forumId,
  assignments,
  members,
}: {
  forumId: string;
  assignments: { id: string; reporterType: "primary" | "secondary"; memberName: string }[];
  members: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(assignReporterAction, initial);
  const router = useRouter();
  const [revoking, startTransition] = useTransition();
  const [revokeError, setRevokeError] = useState<string | null>(null);

  function revoke(id: string) {
    setRevokeError(null);
    startTransition(async () => {
      const result = await revokeReporterAction(id);
      if (result?.error) setRevokeError(result.error);
      router.refresh();
    });
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted">
        The Reporter is the person responsible for filling in this Forum&apos;s monthly report.
      </p>
      {assignments.length === 0 ? (
        <p className="mb-3 text-sm text-muted">No one assigned yet — pick someone below.</p>
      ) : (
        <ul className="mb-3 divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
          {assignments.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>{r.memberName}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted">{reporterTypeLabel(r.reporterType)}</span>
                <button
                  type="button"
                  disabled={revoking}
                  onClick={() => revoke(r.id)}
                  className="text-xs text-red-700 hover:underline disabled:opacity-40 dark:text-red-400"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {revokeError && <p className="mb-2 text-xs text-red-700 dark:text-red-300">{revokeError}</p>}

      {members.length === 0 ? (
        <p className="text-sm text-muted">Add a Forum member first, then you can make them a Reporter.</p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="forumId" value={forumId} />
          {state?.error && <p className="w-full text-xs text-red-700 dark:text-red-300">{state.error}</p>}
          <div>
            <label htmlFor="reporterMemberId" className="ds-label">Who?</label>
            <select id="reporterMemberId" name="memberId" required defaultValue="" className="ds-select">
              <option value="" disabled>Select a member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reporterType" className="ds-label">What role?</label>
            <select id="reporterType" name="reporterType" defaultValue="secondary" className="ds-select">
              <option value="primary">Main Reporter — submits the report</option>
              <option value="secondary">Helper Reporter — can add info</option>
            </select>
          </div>
          <Button type="submit" variant="secondary" size="sm" loading={pending}>
            Make them a Reporter
          </Button>
        </form>
      )}
    </div>
  );
}
