"use client";

import { useActionState } from "react";
import { upsertLeadershipLayer, type AdminActionState } from "@/actions/admin";
import { isHonoraryLeadershipSlug } from "@/lib/leadership-constants";

const initial: AdminActionState = {};

type Layer = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
};

export function LeadershipLayerForm({ layer }: { layer?: Layer | null }) {
  const [state, formAction, pending] = useActionState(upsertLeadershipLayer, initial);
  const slugLocked = Boolean(layer?.slug && isHonoraryLeadershipSlug(layer.slug));

  return (
    <form action={formAction} className="space-y-4">
      {layer?.id && <input type="hidden" name="id" value={layer.id} />}
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
          defaultValue={layer?.title ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Slug (optional)</label>
        {slugLocked ? (
          <>
            <input type="hidden" name="slug" value={layer!.slug} />
            <input
              readOnly
              value={layer!.slug}
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400"
              aria-label="Slug"
            />
            <p className="mt-1 text-xs text-muted">This slug is reserved for the public Honorary Position page.</p>
          </>
        ) : (
          <input
            name="slug"
            defaultValue={layer?.slug ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={layer?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Sort order</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={layer?.sort_order ?? 0}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="lpub-layer"
          defaultChecked={layer?.is_published ?? true}
        />
        <label htmlFor="lpub-layer" className="text-sm">
          Published
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : layer?.id ? "Update layer" : "Create layer"}
      </button>
    </form>
  );
}
