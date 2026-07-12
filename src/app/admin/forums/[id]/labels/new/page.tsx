import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumLabelForm } from "@/components/admin/ForumLabelForm";
import { Card } from "@/components/ui/Card";
import { getForumAdmin } from "@/lib/repositories/forums-repository";

type Props = { params: Promise<{ id: string }> };

export default async function NewForumLabelPage({ params }: Props) {
  const { id } = await params;
  const forum = await getForumAdmin(id);
  if (!forum) {
    notFound();
  }

  return (
    <div>
      <Link href={`/admin/forums/${id}/labels`} className="text-sm text-accent hover:underline">
        ← Labels
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New label</h1>
      <p className="mt-1 text-sm text-muted">Forum: {forum.title}</p>
      <Card className="mt-8 max-w-xl">
        <ForumLabelForm forumId={id} />
      </Card>
    </div>
  );
}
