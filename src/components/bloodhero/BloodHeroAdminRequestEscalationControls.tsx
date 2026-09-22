"use client";

import { useActionState } from "react";
import {
  type UpdateBloodHeroRequestEscalationState,
  overrideBloodHeroRequestCriticality,
  setBloodHeroRequestEscalationPaused,
  setBloodHeroRequestPublic,
} from "@/actions/bloodhero-admin-requests";

const initial: UpdateBloodHeroRequestEscalationState = {};
const levels = ["normal", "urgent", "critical"] as const;

const buttonClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700";

export function BloodHeroAdminRequestEscalationControls({
  requestId,
  criticality,
  paused,
  isPublic,
}: {
  requestId: string;
  criticality: (typeof levels)[number];
  paused: boolean;
  isPublic: boolean;
}) {
  const [pubState, pubAction, pubPending] = useActionState(setBloodHeroRequestPublic, initial);
  const [critState, critAction, critPending] = useActionState(overrideBloodHeroRequestCriticality, initial);
  const [pauseState, pauseAction, pausePending] = useActionState(setBloodHeroRequestEscalationPaused, initial);

  return (
    <div className="mt-3 flex flex-col items-end gap-2">
      <form action={critAction} className="flex items-center gap-2">
        <input type="hidden" name="requestId" value={requestId} />
        <select
          name="criticality"
          defaultValue={criticality}
          disabled={critPending}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <button type="submit" disabled={critPending} className={buttonClass}>
          {critPending ? "Saving..." : "Set criticality"}
        </button>
      </form>
      <form action={pauseAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="paused" value={paused ? "false" : "true"} />
        <button type="submit" disabled={pausePending} className={buttonClass}>
          {pausePending ? "Saving..." : paused ? "Resume escalation" : "Pause escalation"}
        </button>
      </form>
      <form action={pubAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="isPublic" value={isPublic ? "false" : "true"} />
        <button type="submit" disabled={pubPending} className={buttonClass}>
          {pubPending ? "Saving..." : isPublic ? "Hide from public board" : "Show on public board"}
        </button>
      </form>
      {pubState.error && <p className="max-w-[14rem] text-right text-xs text-red-600 dark:text-red-400">{pubState.error}</p>}
      {critState.error &&<p className="max-w-[14rem] text-right text-xs text-red-600 dark:text-red-400">{critState.error}</p>}
      {pauseState.error && <p className="max-w-[14rem] text-right text-xs text-red-600 dark:text-red-400">{pauseState.error}</p>}
    </div>
  );
}
