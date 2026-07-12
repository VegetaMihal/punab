import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterForm } from "@/components/admin/ChapterForm";
import { Card } from "@/components/ui/Card";
import { getChapterAdmin, listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";

type Props = { params: Promise<{ id: string }> };

export default async function EditChapterPage({ params }: Props) {
  const { id } = await params;
  const [chapter, universities] = await Promise.all([getChapterAdmin(id), listUniversitiesForOptions()]);

  if (!chapter) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/chapters" className="text-sm text-accent hover:underline">
        ← Chapters
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit chapter</h1>
      <Card className="mt-8 max-w-xl">
        <ChapterForm chapter={chapter} universities={universities} />
      </Card>
    </div>
  );
}
