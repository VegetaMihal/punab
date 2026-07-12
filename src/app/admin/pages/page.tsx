import Link from "next/link";
import { listPagesAdmin } from "@/actions/cms";
import { DeletePageButton } from "@/components/admin/DeletePageButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Pages",
};

export default async function AdminPagesPage() {
  const pages = await listPagesAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Pages</h1>
          <p className="mt-1 text-sm text-muted">Editable content at /p/your-slug when published.</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New page
        </Link>
      </div>
      <div className="mt-8 space-y-3">
        {pages.length === 0 && (
          <EmptyState title="No pages" description="Create a page and publish it for the public site." />
        )}
        {pages.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
          >
            <div>
              <Link
                href={`/admin/pages/${p.id}`}
                className="font-medium text-stone-900 hover:underline dark:text-stone-50"
              >
                {p.title}
              </Link>
              <p className="text-xs text-muted">
                /p/{p.slug} · {p.is_published ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {p.is_published && (
                <Link href={`/p/${p.slug}`} className="text-sm text-accent hover:underline" target="_blank">
                  View
                </Link>
              )}
              <DeletePageButton id={p.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
