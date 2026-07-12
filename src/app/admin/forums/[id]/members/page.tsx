import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteForumMemberButton } from "@/components/admin/DeleteForumMemberButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getForumAdmin, listForumLabelOptions, listForumMembersAdmin } from "@/lib/repositories/forums-repository";
import type { ForumMember } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export default async function AdminForumMembersPage({ params }: Props) {
  const { id } = await params;
  let forum = null;
  let members: ForumMember[] = [];
  let labelTitles: Record<string, string> = {};
  let error: string | null = null;
  try {
    forum = await getForumAdmin(id);
    if (forum) {
      const [m, opts] = await Promise.all([listForumMembersAdmin(id), listForumLabelOptions(id)]);
      members = m;
      labelTitles = Object.fromEntries(opts.map((o) => [o.id, o.title]));
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
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Forum members</h1>
          <p className="mt-1 text-sm text-muted">Same card layout as executive leadership. Assign each person to a label.</p>
        </div>
        <Link
          href={`/admin/forums/${id}/members/new`}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          Add member
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && members.length === 0 && (
          <EmptyState title="No members" description="Add people for each label section." />
        )}
        {!error &&
          members.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link
                  href={`/admin/forums/${id}/members/${m.id}`}
                  className="font-medium text-stone-900 hover:underline dark:text-stone-50"
                >
                  {m.name}
                </Link>
                <p className="text-xs text-muted">
                  {m.label_id ? labelTitles[m.label_id] ?? "Unknown label" : "No label"} ·{" "}
                  {m.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <DeleteForumMemberButton id={m.id} />
            </div>
          ))}
      </div>
    </div>
  );
}
