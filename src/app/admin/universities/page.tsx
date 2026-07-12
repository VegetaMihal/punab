import Link from "next/link";
import { DeleteUniversityButton } from "@/components/admin/DeleteUniversityButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { listUniversitiesAdmin } from "@/lib/repositories/chapters-repository";
import type { University } from "@/types/database";

export const metadata = {
  title: "Universities",
};

export default async function AdminUniversitiesPage() {
  let universities: University[] = [];
  let error: string | null = null;
  try {
    universities = await listUniversitiesAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Universities</h1>
          <p className="mt-1 text-sm text-muted">Used for membership and chapter linking.</p>
        </div>
        <Link
          href="/admin/universities/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New university
        </Link>
      </div>
      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && universities.length === 0 && (
          <EmptyState title="No universities" description="Seed data or add universities here." />
        )}
        {!error &&
          universities.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link
                  href={`/admin/universities/${u.id}`}
                  className="font-medium text-stone-900 hover:underline dark:text-stone-50"
                >
                  {u.name}
                </Link>
                <p className="text-xs text-muted">{u.district ?? "—"}</p>
              </div>
              <DeleteUniversityButton id={u.id} />
            </div>
          ))}
      </div>
    </div>
  );
}
