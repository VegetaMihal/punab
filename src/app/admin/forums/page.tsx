import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { listForumsAdmin } from "@/lib/repositories/forums-repository";
import type { Forum } from "@/types/database";

export const metadata = {
  title: "Forums",
};

export default async function AdminForumsPage() {
  let forums: Forum[] = [];
  let error: string | null = null;
  try {
    forums = await listForumsAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Forums</h1>
          <p className="mt-1 text-sm text-muted">
            Each forum has its own URL (<code className="rounded bg-stone-100 px-1 dark:bg-stone-800">/forums/slug</code>
            ), configurable labels (sections), and people cards like executive leadership.
          </p>
        </div>
        <Link
          href="/admin/forums/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New forum
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && forums.length === 0 && <EmptyState title="No forums" description="Create a forum to get started." />}
        {!error &&
          forums.map((f) => (
            <div
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link
                  href={`/admin/forums/${f.id}`}
                  className="font-medium text-stone-900 hover:underline dark:text-stone-50"
                >
                  {f.title}
                </Link>
                <p className="text-xs text-muted">
                  /forums/{f.slug} · {f.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/admin/forums/${f.id}/labels`}
                  className="text-accent hover:underline"
                >
                  Labels
                </Link>
                <span className="text-muted">·</span>
                <Link
                  href={`/admin/forums/${f.id}/members`}
                  className="text-accent hover:underline"
                >
                  Members
                </Link>
                <span className="text-muted">·</span>
                <Link href={`/forums/${f.slug}`} className="text-muted hover:underline" target="_blank" rel="noreferrer">
                  View public
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
