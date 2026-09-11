"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approveRecommendationAction, setRecommendationAction } from "@/actions/org";

type Row = {
  memberId: string;
  memberName: string;
  score: number | null;
  comment: string | null;
  needsApproval: boolean;
};

const QUICK_PICKS = [
  { score: 100, label: "Excellent" },
  { score: 85, label: "Good" },
  { score: 70, label: "Okay" },
  { score: 50, label: "Weak" },
  { score: 25, label: "Poor" },
];

function RecommendationRow({ reportId, row, editable }: { reportId: string; row: Row; editable: boolean }) {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(row.score);
  const [comment, setComment] = useState(row.comment ?? "");
  const [pending, startTransition] = useTransition();
  const [approvePending, startApprove] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick(value: number) {
    setScore(value);
    setError(null);
    const formData = new FormData();
    formData.set("reportId", reportId);
    formData.set("memberId", row.memberId);
    formData.set("score", String(value));
    formData.set("comment", comment);
    startTransition(async () => {
      const result = await setRecommendationAction({}, formData);
      if (result?.error) setError(result.error);
      router.refresh();
    });
  }

  function saveComment(nextComment: string) {
    setComment(nextComment);
    if (score === null) return;
    setError(null);
    const formData = new FormData();
    formData.set("reportId", reportId);
    formData.set("memberId", row.memberId);
    formData.set("score", String(score));
    formData.set("comment", nextComment);
    startTransition(async () => {
      const result = await setRecommendationAction({}, formData);
      if (result?.error) setError(result.error);
      router.refresh();
    });
  }

  function approve() {
    setError(null);
    startApprove(async () => {
      const result = await approveRecommendationAction(reportId, row.memberId);
      if (result?.error) setError(result.error);
      router.refresh();
    });
  }

  return (
    <li className="space-y-2 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-[10rem] flex-1 font-medium">
          {row.memberName}
          {row.needsApproval && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              You rated yourself — needs a second person to confirm
            </span>
          )}
        </span>
        {row.needsApproval && (
          <button
            type="button"
            disabled={approvePending}
            onClick={approve}
            className="rounded-md border border-amber-400 px-2 py-1 text-xs font-medium text-amber-800 disabled:opacity-40 dark:text-amber-200"
          >
            Confirm this rating
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_PICKS.map((p) => (
          <button
            key={p.score}
            type="button"
            disabled={!editable || pending}
            onClick={() => pick(p.score)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40 ${
              score === p.score
                ? "border-brand-green bg-brand-green text-white"
                : "border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {score !== null && score < 50 && (
        <input
          type="text"
          placeholder="Why the low rating? (required)"
          value={comment}
          disabled={!editable || pending}
          onChange={(e) => saveComment(e.target.value)}
          className="ds-input w-full"
        />
      )}
      {error && <p className="text-xs text-red-700 dark:text-red-300">{error}</p>}
    </li>
  );
}

export function RecommendationsPanel({
  reportId,
  members,
  editable,
}: {
  reportId: string;
  members: Row[];
  editable: boolean;
}) {
  if (members.length === 0) {
    return <p className="text-sm text-muted">Add members to this Forum first, then come back to rate them.</p>;
  }
  return (
    <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
      {members.map((m) => (
        <RecommendationRow key={m.memberId} reportId={reportId} row={m} editable={editable} />
      ))}
    </ul>
  );
}
