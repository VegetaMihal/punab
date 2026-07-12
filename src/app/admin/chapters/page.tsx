import Link from "next/link";
import { DeleteChapterButton } from "@/components/admin/DeleteChapterButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { listChaptersAdmin } from "@/lib/repositories/chapters-repository";
import type { Chapter } from "@/types/database";

export const metadata = {
  title: "Chapters",
};

export default async function AdminChaptersPage() {
  let chapters: Chapter[] = [];
  let error: string | null = null;
  try {
    chapters = await listChaptersAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">University chapters</h1>
          <p className="mt-1 text-sm text-muted">Link chapters to universities where possible.</p>
        </div>
        <Link
          href="/admin/chapters/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New chapter
        </Link>
      </div>
      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && chapters.length === 0 && (
          <EmptyState title="No chapters" description="Create a chapter entry." />
        )}
        {!error &&
          chapters.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link href={`/admin/chapters/${c.id}`} className="font-medium text-stone-900 hover:underline dark:text-stone-50">
                  {c.title}
                </Link>
                <p className="text-xs text-muted">{c.is_published ? "Published" : "Draft"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/chapters`} className="text-sm text-accent hover:underline" target="_blank">
                  Public list
                </Link>
                <DeleteChapterButton id={c.id} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
