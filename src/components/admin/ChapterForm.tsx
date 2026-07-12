"use client";

import { useActionState } from "react";
import { upsertChapter, type AdminActionState } from "@/actions/admin";
import type { Chapter } from "@/types/database";

const initial: AdminActionState = {};

type Uni = { id: string; name: string };

type Props = {
  chapter?: Chapter | null;
  universities: Uni[];
};

export function ChapterForm({ chapter, universities }: Props) {
  const [state, formAction, pending] = useActionState(upsertChapter, initial);

  return (
    <form action={formAction} className="space-y-4">
      {chapter?.id && <input type="hidden" name="id" value={chapter.id} />}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green-muted px-3 py-2 text-sm text-brand-green">
          Saved.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">University</label>
        <select
          name="universityId"
          defaultValue={chapter?.university_id ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        >
          <option value="">—</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Chapter title</label>
        <input
          name="title"
          required
          defaultValue={chapter?.title ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={chapter?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Contact email</label>
        <input
          name="contactEmail"
          type="email"
          defaultValue={chapter?.contact_email ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Member count (indicative)</label>
        <input
          name="memberCount"
          type="number"
          defaultValue={chapter?.member_count ?? 0}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="cpub"
          defaultChecked={chapter?.is_published ?? true}
        />
        <label htmlFor="cpub" className="text-sm">
          Published
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : chapter?.id ? "Update chapter" : "Create chapter"}
      </button>
    </form>
  );
}
