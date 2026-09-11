import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { listMyReporterForums } from "@/lib/repositories/org-reporters-repository";
import { forumStatusLabel, reporterTypeLabel } from "@/lib/org/labels";

export const metadata = { title: "Reporter Portal" };

export default async function ReporterPortalPage() {
  const { user } = await getSessionProfile();
  if (!user) return null;

  const forums = await listMyReporterForums(user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Your Forums</h1>
      <p className="mb-6 text-sm text-muted">Click a Forum to fill in or update its monthly report.</p>
      {forums.length === 0 ? (
        <p className="text-sm text-muted">
          You&apos;re not set up as a Reporter for any Forum yet. Ask Central Forum Management to authorize you.
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
          {forums.map((f) => (
            <li key={f.forumId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <Link href={`/portal/reporter/forums/${f.forumSlug}/report`} className="font-medium text-brand-green hover:underline">
                  {f.forumName}
                </Link>
                <span className="ml-2 text-xs text-muted">{forumStatusLabel(f.forumStatus)}</span>
              </div>
              <span className="text-xs text-muted">{reporterTypeLabel(f.reporterType)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
