"use client";

import { useActionState } from "react";
import { applyForPromotionAction, type PromotionActionState } from "@/actions/org-promotions";
import { Button } from "@/components/ui/Button";

const initial: PromotionActionState = {};

export function ApplyForPromotionForm({ forumId }: { forumId: string }) {
  const [state, formAction, pending] = useActionState(applyForPromotionAction, initial);

  if (state?.success) {
    return <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">Application submitted.</p>;
  }

  return (
    <form action={formAction} className="mt-1 inline-block">
      <input type="hidden" name="forumId" value={forumId} />
      {state?.error && <p className="mb-1 text-xs text-red-700 dark:text-red-300">{state.error}</p>}
      <Button type="submit" variant="secondary" size="sm" loading={pending}>
        Apply for promotion
      </Button>
    </form>
  );
}
