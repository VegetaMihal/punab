"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateMunApplicationStatusAction } from "@/actions/mun-form";
import { MUN_STATUSES, type MunStatus } from "@/lib/validations/mun-form";

export function MunStatusControls({
  referenceNumber,
  currentStatus,
  currentNote,
}: {
  referenceNumber: string;
  currentStatus: string;
  currentNote: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState(currentNote);
  const [error, setError] = useState<string | null>(null);

  function setStatus(status: MunStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateMunApplicationStatusAction(referenceNumber, status, note);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MUN_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
              currentStatus === s
                ? "bg-brand-red text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Reviewer note (saved with next status change)"
        rows={3}
        className="w-full rounded-lg border border-stone-300 p-2 text-sm dark:border-stone-700 dark:bg-stone-900"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
