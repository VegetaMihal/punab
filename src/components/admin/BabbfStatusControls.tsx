"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateBabbfRegistrationStatusAction } from "@/actions/babbf-registration";
import { BABBF_STATUSES, type BabbfStatus } from "@/lib/validations/babbf-registration";

export function BabbfStatusControls({
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
  const [emailNotice, setEmailNotice] = useState<{ ok: boolean; message: string } | null>(null);

  function setStatus(status: BabbfStatus) {
    setError(null);
    setEmailNotice(null);
    startTransition(async () => {
      const res = await updateBabbfRegistrationStatusAction(referenceNumber, status, note);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.emailSent === true) {
        setEmailNotice({ ok: true, message: "Confirmation email sent to participant." });
      } else if (res.emailSent === false) {
        setEmailNotice({ ok: false, message: `Confirmation email failed to send: ${res.emailError}` });
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {BABBF_STATUSES.map((s) => (
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
      {emailNotice && (
        <p className={`text-sm ${emailNotice.ok ? "text-emerald-600" : "text-amber-600"}`}>
          {emailNotice.ok ? "✓ " : "⚠ "}
          {emailNotice.message}
        </p>
      )}
    </div>
  );
}
