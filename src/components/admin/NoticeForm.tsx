"use client";

import { useActionState } from "react";
import { upsertNotice, type AdminActionState } from "@/actions/admin";
import type { Notice } from "@/types/database";

const initial: AdminActionState = {};

function toLocal(iso: string | null | undefined) {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  notice?: Notice | null;
};

export function NoticeForm({ notice }: Props) {
  const [state, formAction, pending] = useActionState(upsertNotice, initial);

  return (
    <form action={formAction} className="space-y-4">
      {notice?.id && <input type="hidden" name="id" value={notice.id} />}
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
          defaultValue={notice?.title ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Slug (optional)</label>
        <input
          name="slug"
          defaultValue={notice?.slug ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Excerpt</label>
        <input
          name="excerpt"
          defaultValue={notice?.excerpt ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Body</label>
        <textarea
          name="body"
          required
          rows={8}
          defaultValue={notice?.body ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="npub"
          defaultChecked={notice?.is_published ?? false}
        />
        <label htmlFor="npub" className="text-sm">
          Published
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium">Published at</label>
        <input
          type="datetime-local"
          name="publishedAt"
          defaultValue={toLocal(notice?.published_at)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : notice?.id ? "Update notice" : "Create notice"}
      </button>
    </form>
  );
}
