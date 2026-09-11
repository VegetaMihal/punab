import Link from "next/link";
import { notFound } from "next/navigation";
import { computeFullForumEligibility, getForumBySlug } from "@/lib/repositories/org-forums-repository";
import { listApprovedMembersNotInForum } from "@/lib/repositories/org-memberships-repository";
import { listCampusRoles } from "@/lib/repositories/org-campus-repository";
import { listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";
import { ForumStatusPanel } from "@/components/org/ForumStatusPanel";
import { AddMemberForm } from "@/components/org/AddMemberForm";
import { ReporterPanel } from "@/components/org/ReporterPanel";
import { CampusCommitteePanel } from "@/components/org/CampusCommitteePanel";
import { forumStatusLabel } from "@/lib/org/labels";

export const metadata = { title: "Forum detail — Org Portal" };

export default async function ForumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const forum = await getForumBySlug(slug);
  if (!forum) notFound();

  const [eligibility, candidateMembers, campusRoles, campuses] = await Promise.all([
    forum.status === "incomplete" ? computeFullForumEligibility(forum.id) : Promise.resolve(null),
    listApprovedMembersNotInForum(forum.id),
    forum.status === "full" ? listCampusRoles(forum.id) : Promise.resolve([]),
    forum.status === "full" ? listUniversitiesForOptions() : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{forum.name}</h1>
          <p className="text-sm text-muted">
            {forumStatusLabel(forum.status)} · {forum.scheme.name}
          </p>
        </div>
        <Link
          href={`/portal/admin/forums/${forum.slug}/report`}
          className="rounded-md bg-brand-green px-3 py-1.5 text-sm font-medium text-white"
        >
          Open this month&apos;s report
        </Link>
      </div>

      <ForumStatusPanel forumId={forum.id} status={forum.status as "incomplete" | "full"} eligibility={eligibility} />

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

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Who submits the report</h2>
        <ReporterPanel
          forumId={forum.id}
          assignments={forum.reporter_assignments.map((r) => ({
            id: r.id,
            reporterType: r.reporter_type as "primary" | "secondary",
            memberName: r.member.full_name,
          }))}
          members={forum.memberships.map((m) => ({ id: m.member.id, full_name: m.member.full_name }))}
        />
      </section>

      {forum.status === "full" && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Campus committee</h2>
          <CampusCommitteePanel
            forumId={forum.id}
            roles={campusRoles.map((r) => ({
              id: r.id,
              campusName: r.campus.name,
              memberName: r.member.full_name,
              level: r.campus_level,
            }))}
            campuses={campuses}
            members={candidateMembers}
          />
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">History</h2>
        <ul className="space-y-1 text-sm text-muted">
          {forum.status_history.map((h) => (
            <li key={h.id}>
              {h.effective_at.toLocaleDateString()}: changed from &quot;{h.old_status}&quot; to &quot;{h.new_status}&quot;
              {h.notes ? ` — ${h.notes}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
