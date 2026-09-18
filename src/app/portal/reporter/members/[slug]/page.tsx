import { notFound, redirect } from "next/navigation";
import { getForumBySlug } from "@/lib/repositories/org-forums-repository";
import { listApprovedMembersNotInForum } from "@/lib/repositories/org-memberships-repository";
import { assertCanManageMembers } from "@/lib/auth/require-reporter";
import { AddMemberForm } from "@/components/org/AddMemberForm";
import { forumStatusLabel } from "@/lib/org/labels";

export const metadata = { title: "Forum members — Reporter Portal" };

export default async function ReporterMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const forum = await getForumBySlug(slug);
  if (!forum) notFound();

  try {
    await assertCanManageMembers(forum.id);
  } catch {
    redirect("/portal/reporter/members");
  }

  const candidateMembers = await listApprovedMembersNotInForum(forum.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{forum.name}</h1>
        <p className="text-sm text-muted">{forumStatusLabel(forum.status)}</p>
      </div>

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Members</h2>
        <p className="mb-2 text-xs text-muted">Everyone currently active in this Forum, and what role they hold.</p>
        {forum.memberships.length === 0 ? (
          <p className="mb-3 text-sm text-muted">No one added yet.</p>
        ) : (
          <ul className="mb-3 divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {forum.memberships.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{m.member.full_name}</span>
                <span className="text-muted">{m.designation.label}</span>
              </li>
            ))}
          </ul>
        )}
        <AddMemberForm
          forumId={forum.id}
          members={candidateMembers}
          designationLevels={forum.scheme.levels.map((l) => ({ id: l.id, label: l.label }))}
        />
      </section>
    </div>
  );
}
