import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumLabelForm } from "@/components/admin/ForumLabelForm";
import { Card } from "@/components/ui/Card";
import { getForumAdmin, getForumLabelAdmin } from "@/lib/repositories/forums-repository";

type Props = { params: Promise<{ id: string; labelId: string }> };

export default async function EditForumLabelPage({ params }: Props) {
  const { id, labelId } = await params;
  const [forum, label] = await Promise.all([getForumAdmin(id), getForumLabelAdmin(labelId)]);
  if (!forum || !label || label.forum_id !== id) {
    notFound();
  }

  return (
    <div>
      <Link href={`/admin/forums/${id}/labels`} className="text-sm text-accent hover:underline">
        ← Labels
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit label</h1>
      <Card className="mt-8 max-w-xl">
        <ForumLabelForm forumId={id} label={label} />
      </Card>
    </div>
  );
}
