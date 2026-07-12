"use client";

import { useActionState } from "react";
import { upsertForum, type AdminActionState } from "@/actions/admin";
import type { Forum } from "@/types/database";

const initial: AdminActionState = {};

export function ForumForm({ forum }: { forum?: Forum | null }) {
  const [state, formAction, pending] = useActionState(upsertForum, initial);

  return (
    <form action={formAction} className="space-y-4">
      {forum?.id && <input type="hidden" name="id" value={forum.id} />}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green-muted px-3 py-2 text-sm text-brand-green">
          Saved.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          defaultValue={forum?.title ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">URL slug (optional)</label>
        <input
          name="slug"
          defaultValue={forum?.slug ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
        <p className="mt-1 text-xs text-muted">Public URL: /forums/your-slug</p>
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={forum?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Sort order</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={forum?.sort_order ?? 0}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="fpub"
          defaultChecked={forum?.is_published ?? true}
        />
        <label htmlFor="fpub" className="text-sm">
          Published
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : forum?.id ? "Update forum" : "Create forum"}
      </button>
    </form>
  );
}
