import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { listMyReporterForums } from "@/lib/repositories/org-reporters-repository";
import { listForums } from "@/lib/repositories/org-forums-repository";
import { forumStatusLabel } from "@/lib/org/labels";

export const metadata = { title: "Members — Reporter Portal" };

export default async function ReporterMembersHubPage() {
  const { user, adminAccess } = await getSessionProfile();
  if (!user) redirect("/login");

  const forums = adminAccess?.canOrgPortal
    ? (await listForums()).map((f) => ({ forumId: f.id, forumName: f.name, forumSlug: f.slug, forumStatus: f.status }))
    : (await listMyReporterForums(user.id))
        .filter((f) => f.reporterType === "primary")
        .map((f) => ({ forumId: f.forumId, forumName: f.forumName, forumSlug: f.forumSlug, forumStatus: f.forumStatus }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Members</h1>
      <p className="mb-6 text-sm text-muted">
        Add members to your Forum and set their level — a Forum Secretary or Convenor automatically
        becomes that Forum&apos;s Reporter.
      </p>
      {forums.length === 0 ? (
        <p className="text-sm text-muted">
          You&apos;re not the Primary Reporter for any Forum yet, so there&apos;s nothing to manage here.
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
          {forums.map((f) => (
            <li key={f.forumId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <Link href={`/portal/reporter/members/${f.forumSlug}`} className="font-medium text-brand-green hover:underline">
                {f.forumName}
              </Link>
              <span className="text-xs text-muted">{forumStatusLabel(f.forumStatus)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
