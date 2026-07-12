import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadershipForm } from "@/components/admin/LeadershipForm";
import { Card } from "@/components/ui/Card";
import { getLeadershipMemberAdmin, listLeadershipLayerOptions } from "@/lib/repositories/leadership-repository";

type Props = { params: Promise<{ id: string }> };

export default async function EditLeadershipPage({ params }: Props) {
  const { id } = await params;
  const [member, layers] = await Promise.all([getLeadershipMemberAdmin(id), listLeadershipLayerOptions()]);

  if (!member) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/leadership" className="text-sm text-accent hover:underline">
        ← Executive leadership
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit leadership</h1>
      <Card className="mt-8 max-w-xl">
        <LeadershipForm member={member} layers={layers} />
      </Card>
    </div>
  );
}
