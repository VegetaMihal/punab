"use client";

import { useActionState } from "react";
import { addPlannedActivityAction, type OrgActionState } from "@/actions/org";
import { Button } from "@/components/ui/Button";

const initial: OrgActionState = {};

export function PlannedActivityForm({
  reportId,
  members,
}: {
  reportId: string;
  members: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(addPlannedActivityAction, initial);

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-stone-200 p-4 dark:border-stone-800">
      <input type="hidden" name="reportId" value={reportId} />
      {state?.error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" role="alert">
          {state.error}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="planName" className="ds-label">What are you planning?</label>
          <input id="planName" name="name" type="text" required minLength={2} className="ds-input" />
        </div>
        <div>
          <label htmlFor="approximateDate" className="ds-label">Roughly when?</label>
          <input id="approximateDate" name="approximateDate" type="date" required className="ds-input" />
        </div>
      </div>
      <div>
        <label htmlFor="planDescription" className="ds-label">Why / what&apos;s the goal? (optional)</label>
        <input id="planDescription" name="description" type="text" className="ds-input" />
      </div>
      {members.length > 0 && (
        <div>
          <span className="ds-label">Who&apos;s doing it?</span>
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-stone-200 p-2 dark:border-stone-800">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="memberIds" value={m.id} />
                {m.full_name}
              </label>
            ))}
          </div>
        </div>
      )}
      <Button type="submit" variant="secondary" size="sm" loading={pending}>
        Add to next month&apos;s plan
      </Button>
    </form>
  );
}
