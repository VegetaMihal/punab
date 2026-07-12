import Link from "next/link";
import { DeleteNoticeButton } from "@/components/admin/DeleteNoticeButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { listNoticesAdmin } from "@/lib/repositories/notices-repository";
import type { Notice } from "@/types/database";

export const metadata = {
  title: "Notices",
};

export default async function AdminNoticesPage() {
  let notices: Notice[] = [];
  let error: string | null = null;
  try {
    notices = await listNoticesAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Notices</h1>
          <p className="mt-1 text-sm text-muted">Create and publish notices for the public site.</p>
        </div>
        <Link
          href="/admin/notices/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New notice
        </Link>
      </div>
      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && notices.length === 0 && <EmptyState title="No notices" description="Create your first notice." />}
        {!error &&
          notices.map((n) => (
            <div
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link href={`/admin/notices/${n.id}`} className="font-medium text-stone-900 hover:underline dark:text-stone-50">
                  {n.title}
                </Link>
                <p className="text-xs text-muted">
                  {n.is_published ? "Published" : "Draft"}
                  {n.published_at && ` · ${new Date(n.published_at).toLocaleDateString("en-GB")}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/notices/${n.id}`} className="text-sm text-accent hover:underline" target="_blank">
                  View
                </Link>
                <DeleteNoticeButton id={n.id} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
