import Link from "next/link";
import { ChapterForm } from "@/components/admin/ChapterForm";
import { Card } from "@/components/ui/Card";
import { listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";

export const metadata = {
  title: "New chapter",
};

export default async function NewChapterPage() {
  const universities = await listUniversitiesForOptions();

  return (
    <div>
      <Link href="/admin/chapters" className="text-sm text-accent hover:underline">
        ← Chapters
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New chapter</h1>
      <Card className="mt-8 max-w-xl">
        <ChapterForm universities={universities} />
      </Card>
    </div>
  );
}
