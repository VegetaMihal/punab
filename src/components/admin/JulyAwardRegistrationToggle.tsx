"use client";

import { useState, useTransition } from "react";
import { setJulyAwardRegistrationOpen } from "@/actions/cms";

export function JulyAwardRegistrationToggle({ initialOpen }: { initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !open;
    setError(null);
    startTransition(async () => {
      const res = await setJulyAwardRegistrationOpen(next);
      if (res.error) {
        setError(res.error);
        return;
      }
      setOpen(next);
    });
  }

  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <span className="text-sm text-muted">
        Participant registration is{" "}
        <span className={open ? "font-semibold text-green-700 dark:text-green-400" : "font-semibold text-red-700 dark:text-red-400"}>
          {open ? "open" : "closed"}
        </span>
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="rounded-md bg-brand-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red/90 disabled:opacity-50"
      >
        {isPending ? "Saving…" : open ? "Close registration" : "Open registration"}
      </button>
      {error && <span className="text-xs text-red-700 dark:text-red-400">{error}</span>}
    </div>
  );
}
