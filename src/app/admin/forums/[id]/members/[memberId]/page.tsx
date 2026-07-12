import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteForumMemberButton } from "@/components/admin/DeleteForumMemberButton";
import { ForumMemberForm } from "@/components/admin/ForumMemberForm";
import { Card } from "@/components/ui/Card";
import { getForumMemberAdmin, listForumLabelOptions } from "@/lib/repositories/forums-repository";

type Props = { params: Promise<{ id: string; memberId: string }> };

export default async function EditForumMemberPage({ params }: Props) {
  const { id, memberId } = await params;
  const [member, labels] = await Promise.all([getForumMemberAdmin(memberId), listForumLabelOptions(id)]);
  if (!member || member.forum_id !== id) {
    notFound();
  }

  return (
    <div>
      <Link href={`/admin/forums/${id}/members`} className="text-sm text-accent hover:underline">
        ← Members
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit forum member</h1>
      <Card className="mt-8 max-w-xl">
        <ForumMemberForm forumId={id} member={member} labels={labels} />
      </Card>
      <div className="mt-6">
        <DeleteForumMemberButton id={member.id} redirectAfterDelete={`/admin/forums/${id}/members`} />
      </div>
    </div>
  );
}
