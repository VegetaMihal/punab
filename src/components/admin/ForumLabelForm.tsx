"use client";

import { useActionState } from "react";
import { upsertForumLabel, type AdminActionState } from "@/actions/admin";
import type { ForumLabel } from "@/types/database";

const initial: AdminActionState = {};

type Props = {
  forumId: string;
  label?: ForumLabel | null;
};

export function ForumLabelForm({ forumId, label }: Props) {
  const [state, formAction, pending] = useActionState(upsertForumLabel, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="forumId" value={forumId} />
      {label?.id && <input type="hidden" name="id" value={label.id} />}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green-muted px-3 py-2 text-sm text-brand-green">
          Saved.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Label title</label>
        <input
          name="title"
          required
          defaultValue={label?.title ?? ""}
          placeholder="e.g. Debate Moderator"
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
        <p className="mt-1 text-xs text-muted">Shown as a section heading on the public forum page.</p>
      </div>
      <div>
        <label className="block text-sm font-medium">Description (optional)</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={label?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Sort order</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={label?.sort_order ?? 0}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="flPub"
          defaultChecked={label?.is_published ?? true}
        />
        <label htmlFor="flPub" className="text-sm">
          Published
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : label?.id ? "Update label" : "Create label"}
      </button>
    </form>
  );
}
