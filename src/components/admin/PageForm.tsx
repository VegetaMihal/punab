"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePage, type CmsResult } from "@/actions/cms";
import type { PageRow } from "@/types/database";
import { Card } from "@/components/ui/Card";

const initial: CmsResult = {};

type Props = {
  page?: PageRow | null;
};

export function PageForm({ page }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(savePage, initial);

  useEffect(() => {
    if (state?.success) {
      toast.success("Page saved");
      if (!page?.id && state.id) {
        router.push(`/admin/pages/${state.id}`);
        router.refresh();
      } else if (!page?.id) {
        router.push("/admin/pages");
        router.refresh();
      }
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, page?.id, router]);

  return (
    <Card className="max-w-2xl p-6">
      <form action={formAction} className="space-y-4">
        {page?.id && <input type="hidden" name="id" value={page.id} />}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            required
            defaultValue={page?.title ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            name="slug"
            required
            defaultValue={page?.slug ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm dark:border-stone-600 dark:bg-stone-900"
            placeholder="my-page-url"
          />
          <p className="mt-1 text-xs text-muted">Public URL: /p/your-slug</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Meta description (optional)</label>
          <input
            name="metaDescription"
            defaultValue={page?.meta_description ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Body</label>
          <textarea
            name="body"
            rows={14}
            defaultValue={page?.body ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" value="true" defaultChecked={page?.is_published ?? false} />
          Published (visible at /p/slug)
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : page?.id ? "Update page" : "Create page"}
        </button>
      </form>
    </Card>
  );
}
