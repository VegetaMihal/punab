import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumMemberForm } from "@/components/admin/ForumMemberForm";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getForumAdmin, listForumLabelOptions } from "@/lib/repositories/forums-repository";

type SearchParams = { labelId?: string };

export default async function NewForumMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const forum = await getForumAdmin(id);
  if (!forum) {
    notFound();
  }
  const labels = await listForumLabelOptions(id);
  const defaultLabelId =
    sp.labelId && labels.some((l) => l.id === sp.labelId) ? sp.labelId : labels[0]?.id;

  return (
    <div>
      <Link href={`/admin/forums/${id}/members`} className="text-sm text-accent hover:underline">
        ← Members
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Add forum member</h1>
      <p className="mt-1 text-sm text-muted">Forum: {forum.title}</p>
      {labels.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Add a label first"
            description="Create at least one label for this forum before adding members."
            action={
              <Link
                href={`/admin/forums/${id}/labels/new`}
                className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
              >
                New label
              </Link>
            }
          />
        </div>
      ) : (
        <Card className="mt-8 max-w-xl">
          <ForumMemberForm forumId={id} labels={labels} defaultLabelId={defaultLabelId} />
        </Card>
      )}
    </div>
  );
}
