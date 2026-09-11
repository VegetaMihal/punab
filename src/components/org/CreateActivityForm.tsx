"use client";

import { useActionState, useState } from "react";
import { createActivityAction, type OrgActionState } from "@/actions/org";
import { activityStatusLabel } from "@/lib/org/labels";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["planned", "completed", "partially_completed", "not_completed", "rescheduled", "cancelled"];

const initial: OrgActionState = {};

export function CreateActivityForm({
  reportId,
  members,
}: {
  reportId: string;
  members: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createActivityAction, initial);
  const [selectAll, setSelectAll] = useState(false);

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-stone-200 p-4 dark:border-stone-800">
      <input type="hidden" name="reportId" value={reportId} />
      {state?.error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" role="alert">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="ds-label">What was it?</label>
        <input id="name" name="name" type="text" required minLength={2} className="ds-input" placeholder="e.g. Weekly meeting, campus visit, workshop" />
      </div>
      <div>
        <label htmlFor="description" className="ds-label">Any extra details? (optional)</label>
        <textarea id="description" name="description" rows={2} className="ds-input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="isPlanned" className="ds-label">Was this already planned?</label>
          <select id="isPlanned" name="isPlanned" defaultValue="false" className="ds-select">
            <option value="false">No, this came up</option>
            <option value="true">Yes, it was on the plan</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="ds-label">How did it go?</label>
          <select id="status" name="status" defaultValue="completed" className="ds-select">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{activityStatusLabel(s)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="actualDate" className="ds-label">When did it happen?</label>
          <input id="actualDate" name="actualDate" type="date" className="ds-input" />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="ds-label">Who was responsible?</span>
          <label className="flex items-center gap-1 text-xs text-muted">
            <input type="checkbox" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)} />
            Everyone
          </label>
        </div>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-stone-200 p-2 dark:border-stone-800">
          {members.map((m) => (
            <label key={`${m.id}-${selectAll}`} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="memberIds" value={m.id} defaultChecked={selectAll} />
              {m.full_name}
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" variant="primary" size="sm" loading={pending}>
        Add this
      </Button>
    </form>
  );
}
