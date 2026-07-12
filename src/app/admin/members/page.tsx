import Link from "next/link";
import { MembersTable } from "@/components/admin/MembersTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { listAllProfilesAdmin } from "@/lib/repositories/profiles-repository";

export const metadata = {
  title: "Members",
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminMembersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let profiles: Awaited<ReturnType<typeof listAllProfilesAdmin>>["profiles"] = [];
  let total = 0;
  let pageSize = 50;
  let error: string | null = null;

  try {
    ({ profiles, total, pageSize } = await listAllProfilesAdmin(page));
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Member applications</h1>
      <p className="mt-1 text-sm text-muted">Approve, reject, or reset membership status.</p>
      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        {error && <EmptyState title="Could not load members" description={error} />}
        {!error && profiles.length === 0 && (
          <EmptyState title="No profiles" description="No members have registered yet." />
        )}
        {!error && profiles.length > 0 && <MembersTable members={profiles} />}
      </div>
      {!error && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}`}
                className="rounded border border-stone-300 px-3 py-1 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`?page=${page + 1}`}
                className="rounded border border-stone-300 px-3 py-1 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
