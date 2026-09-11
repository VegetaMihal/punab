"use client";

import { useActionState } from "react";
import { setForumStatusAction, type OrgActionState } from "@/actions/org";
import { Button } from "@/components/ui/Button";
import type { FullForumEligibility } from "@/lib/repositories/org-forums-repository";

const initial: OrgActionState = {};

export function ForumStatusPanel({
  forumId,
  status,
  eligibility,
}: {
  forumId: string;
  status: "incomplete" | "full";
  eligibility: FullForumEligibility | null;
}) {
  const [state, formAction, pending] = useActionState(setForumStatusAction, initial);

  if (status === "full") {
    return (
      <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950">
        This Forum is <strong>fully recognized</strong> — it can run its own campus committee now.
      </div>
    );
  }

  if (!eligibility) return null;
  const checks = [
    eligibility.checks.minAge,
    eligibility.checks.leadership,
    eligibility.checks.activeLeadershipTeam,
    eligibility.checks.monthlyReports,
  ];

  return (
    <div className="rounded-md border border-stone-200 p-4 dark:border-stone-800">
      <h2 className="mb-1 text-sm font-semibold">
        {eligibility.eligible ? "Ready to become a Full Forum" : "Not ready to become a Full Forum yet"}
      </h2>
      <p className="mb-2 text-xs text-muted">These are the things a Forum needs before it can run independently.</p>
      <ul className="mb-4 space-y-1 text-sm">
        {checks.map((c, i) => (
          <li key={i} className={c.pass ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
            {c.pass ? "✓" : "✗"} {c.label}
          </li>
        ))}
      </ul>
      {state?.error && (
        <p className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="forumId" value={forumId} />
        <input type="hidden" name="newStatus" value="full" />
        <input
          type="text"
          name="notes"
          placeholder="Note (optional)"
          className="ds-input max-w-xs flex-1"
        />
        <Button type="submit" variant="primary" size="sm" loading={pending} disabled={!eligibility.eligible}>
          Make it a Full Forum
        </Button>
      </form>
      <p className="ds-helper mt-2">
        Meeting these conditions doesn&apos;t do this automatically — you have to click the button to confirm it.
      </p>
    </div>
  );
}
