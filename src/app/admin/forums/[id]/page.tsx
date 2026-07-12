import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteForumButton } from "@/components/admin/DeleteForumButton";
import { ForumForm } from "@/components/admin/ForumForm";
import { Card } from "@/components/ui/Card";
import { getForumAdmin } from "@/lib/repositories/forums-repository";

type Props = { params: Promise<{ id: string }> };

export default async function EditForumPage({ params }: Props) {
  const { id } = await params;
  const forum = await getForumAdmin(id);
  if (!forum) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/forums" className="text-sm text-accent hover:underline">
        ← Forums
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit forum</h1>
      <Card className="mt-8 max-w-xl">
        <ForumForm forum={forum} />
      </Card>
      <div className="mt-8 flex flex-wrap gap-4 border-t border-stone-200 pt-8 dark:border-stone-700">
        <Link
          href={`/admin/forums/${id}/labels`}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          Manage labels
        </Link>
        <Link
          href={`/admin/forums/${id}/members`}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          Manage members
        </Link>
        <Link
          href={`/forums/${forum.slug}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          View public page
        </Link>
      </div>
      <div className="mt-10">
        <DeleteForumButton id={forum.id} />
      </div>
    </div>
  );
}
