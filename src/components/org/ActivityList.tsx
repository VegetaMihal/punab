"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setActivityResultAction, setActivityStatusAction } from "@/actions/org";
import { activityStatusLabel, resultTypeLabel } from "@/lib/org/labels";

type AssignedMember = {
  assignmentId: string;
  memberId: string;
  memberName: string;
  resultType: string | null;
};

type Activity = {
  id: string;
  name: string;
  description: string | null;
  isPlanned: boolean;
  status: string;
  plannedDate: string | null;
  actualDate: string | null;
  assignedMembers: AssignedMember[];
};

const STATUS_OPTIONS = ["planned", "completed", "partially_completed", "not_completed", "rescheduled", "cancelled"];
const RESULT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Not graded yet" },
  { value: "completed", label: resultTypeLabel("completed") },
  { value: "partial_obstacle", label: resultTypeLabel("partial_obstacle") },
  { value: "absent_approved", label: resultTypeLabel("absent_approved") },
  { value: "absent_unapproved", label: resultTypeLabel("absent_unapproved") },
  { value: "cancelled", label: resultTypeLabel("cancelled") },
];

export function ActivityList({
  reportId,
  activities,
  editable,
}: {
  reportId: string;
  activities: Activity[];
  editable: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resultPending, startResultTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function changeStatus(activityId: string, reportId: string, status: string) {
    setError(null);
    const formData = new FormData();
    formData.set("activityId", activityId);
    formData.set("reportId", reportId);
    formData.set("status", status);
    startTransition(async () => {
      const result = await setActivityStatusAction({}, formData);
      if (result?.error) setError(result.error);
      router.refresh();
    });
  }

  function changeResult(assignmentId: string, resultType: string) {
    if (!resultType) return;
    setError(null);
    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    formData.set("resultType", resultType);
    startResultTransition(async () => {
      const result = await setActivityResultAction({}, formData);
      if (result?.error) setError(result.error);
      router.refresh();
    });
  }

  if (activities.length === 0) {
    return <p className="text-sm text-muted">No activities recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-700 dark:text-red-300">{error}</p>}
      <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
        {activities.map((a) => (
          <li key={a.id} className="space-y-2 px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                {a.name} {!a.isPlanned && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:bg-amber-900 dark:text-amber-200">Extra — wasn&apos;t on the plan</span>}
              </span>
              {editable ? (
                <select
                  value={a.status}
                  disabled={pending}
                  onChange={(e) => changeStatus(a.id, reportId, e.target.value)}
                  className="ds-select w-auto text-xs"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{activityStatusLabel(s)}</option>
                  ))}
                </select>
              ) : (
                <span className="text-muted">{activityStatusLabel(a.status)}</span>
              )}
            </div>
            {a.description && <p className="text-muted">{a.description}</p>}
            {a.assignedMembers.length > 0 && (
              <ul className="space-y-1 rounded-md bg-stone-50 p-2 dark:bg-stone-900">
                {a.assignedMembers.map((m) => (
                  <li key={m.assignmentId} className="flex flex-wrap items-center justify-between gap-2">
                    <span>{m.memberName}</span>
                    {editable ? (
                      <select
                        defaultValue={m.resultType ?? ""}
                        disabled={resultPending}
                        onChange={(e) => changeResult(m.assignmentId, e.target.value)}
                        className="ds-select w-auto text-xs"
                      >
                        {RESULT_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-muted">
                        {RESULT_OPTIONS.find((r) => r.value === m.resultType)?.label ?? "Not graded yet"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
