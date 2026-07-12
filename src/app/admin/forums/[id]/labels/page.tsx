import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteForumLabelButton } from "@/components/admin/DeleteForumLabelButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getForumAdmin, listForumLabelsAdmin } from "@/lib/repositories/forums-repository";
import type { ForumLabel } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export default async function AdminForumLabelsPage({ params }: Props) {
  const { id } = await params;
  let forum = null;
  let labels: ForumLabel[] = [];
  let error: string | null = null;
  try {
    forum = await getForumAdmin(id);
    if (forum) {
      labels = await listForumLabelsAdmin(id);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  if (!forum && !error) {
    notFound();
  }

  return (
    <div>
      <Link href={`/admin/forums/${id}`} className="text-sm text-accent hover:underline">
        ← {forum?.title ?? "Forum"}
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Forum labels</h1>
          <p className="mt-1 text-sm text-muted">
            Labels become section headings on the public forum page. Each forum has its own set (e.g. Debate Moderator,
            Media Moderator).
          </p>
        </div>
        <Link
          href={`/admin/forums/${id}/labels/new`}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          Add label
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && labels.length === 0 && (
          <EmptyState title="No labels" description="Add labels to group members on the public page." />
        )}
        {!error &&
          labels.map((l) => (
            <div
              key={l.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link
                  href={`/admin/forums/${id}/labels/${l.id}`}
                  className="font-medium text-stone-900 hover:underline dark:text-stone-50"
                >
                  {l.title}
                </Link>
                <p className="text-xs text-muted">
                  Sort {l.sort_order} · {l.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <DeleteForumLabelButton id={l.id} />
            </div>
          ))}
      </div>
    </div>
  );
}
