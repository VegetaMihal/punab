"use client";

import { useActionState } from "react";
import { upsertUniversity, type AdminActionState } from "@/actions/admin";
import type { University } from "@/types/database";

const initial: AdminActionState = {};

type Props = {
  university?: University | null;
};

export function UniversityForm({ university }: Props) {
  const [state, formAction, pending] = useActionState(upsertUniversity, initial);

  return (
    <form action={formAction} className="space-y-4">
      {university?.id && <input type="hidden" name="id" value={university.id} />}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green-muted px-3 py-2 text-sm text-brand-green">
          Saved.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          required
          defaultValue={university?.name ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Slug (optional)</label>
        <input
          name="slug"
          defaultValue={university?.slug ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">District</label>
        <input
          name="district"
          defaultValue={university?.district ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : university?.id ? "Update" : "Create"}
      </button>
    </form>
  );
}
