"use client";

import { useActionState } from "react";
import {
  type UpdateBloodHeroRequestConditionState,
  updateBloodHeroRequestCondition,
} from "@/actions/bloodhero-admin-requests";

const initial: UpdateBloodHeroRequestConditionState = {};

export function BloodHeroAdminRequestConditionEditor({
  requestId,
  initialCondition,
  initialVoiceTranscript,
}: {
  requestId: string;
  initialCondition: string | null;
  initialVoiceTranscript: string | null;
}) {
  const [state, action, pending] = useActionState(updateBloodHeroRequestCondition, initial);

  return (
    <form action={action} className="space-y-3" key={`${requestId}:${initialCondition ?? ""}:${initialVoiceTranscript ?? ""}`}>
      <input type="hidden" name="requestId" value={requestId} />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Edit both final condition text and raw transcript, then save.
      </p>

      <div>
        <label
          htmlFor="admin_patient_condition"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Condition or notes
        </label>
        <textarea
          id="admin_patient_condition"
          name="patient_condition"
          rows={4}
          defaultValue={initialCondition ?? ""}
          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="Type or edit condition details"
          disabled={pending}
        />
      </div>
      <div>
        <label
          htmlFor="admin_condition_voice_transcript"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Voice transcript (raw)
        </label>
        <textarea
          id="admin_condition_voice_transcript"
          name="condition_voice_transcript"
          rows={4}
          defaultValue={initialVoiceTranscript ?? ""}
          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="Edit raw transcript if needed"
          disabled={pending}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {pending ? "Saving..." : "Save condition"}
        </button>
        {state.success ? <p className="text-xs text-emerald-700 dark:text-emerald-400">Saved.</p> : null}
        {state.error ? <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p> : null}
      </div>
    </form>
  );
}
