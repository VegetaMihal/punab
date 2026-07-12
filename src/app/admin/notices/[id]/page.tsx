import Link from "next/link";
import { notFound } from "next/navigation";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { Card } from "@/components/ui/Card";
import { getNoticeAdmin } from "@/lib/repositories/notices-repository";

type Props = { params: Promise<{ id: string }> };

export default async function EditNoticePage({ params }: Props) {
  const { id } = await params;
  const notice = await getNoticeAdmin(id);

  if (!notice) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/notices" className="text-sm text-accent hover:underline">
        ← All notices
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit notice</h1>
      <Card className="mt-8 max-w-2xl">
        <NoticeForm notice={notice} />
      </Card>
    </div>
  );
}
