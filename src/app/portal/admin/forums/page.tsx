import Link from "next/link";
import { listForums, listHierarchySchemes } from "@/lib/repositories/org-forums-repository";
import { SeedStandardSchemeButton } from "@/components/org/SeedStandardSchemeButton";
import { forumStatusLabel } from "@/lib/org/labels";

export const metadata = { title: "Forums — Org Portal" };

export default async function OrgForumsPage() {
  const [forums, schemes] = await Promise.all([listForums(), listHierarchySchemes()]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Forums</h1>
          <p className="text-sm text-muted">Click a Forum to manage its members, reporters, and monthly report.</p>
        </div>
        <Link
          href="/portal/admin/forums/new"
          className="rounded-md bg-brand-green px-3 py-1.5 text-sm font-medium text-white"
        >
          + New Forum
        </Link>
      </div>

      {schemes.length === 0 && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950">
          <p className="mb-2">
            Before you can create a Forum, set up the standard leadership levels (Forum Member all the way up to
            Forum Convenor) — one click, only needed once.
          </p>
          <SeedStandardSchemeButton />
        </div>
      )}

      {forums.length === 0 ? (
        <p className="text-sm text-muted">No Forums yet — create the first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-stone-200 dark:border-stone-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Members</th>
              </tr>
            </thead>
            <tbody>
              {forums.map((f) => (
                <tr key={f.id} className="border-b border-stone-100 last:border-0 dark:border-stone-900">
                  <td className="px-4 py-3">
                    <Link href={`/portal/admin/forums/${f.slug}`} className="font-medium text-brand-green hover:underline">
                      {f.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{forumStatusLabel(f.status)}</td>
                  <td className="px-4 py-3">{f._count.memberships}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
