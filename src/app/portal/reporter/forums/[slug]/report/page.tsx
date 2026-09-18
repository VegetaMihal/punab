import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { assertReporterAccess } from "@/lib/auth/require-reporter";
import { getForumBySlug } from "@/lib/repositories/org-forums-repository";
import { ForumReportView } from "@/components/org/ForumReportView";
import { ReporterPanel } from "@/components/org/ReporterPanel";

export const metadata = { title: "Monthly report — Reporter Portal" };

export default async function ReporterForumReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user } = await getSessionProfile();
  if (!user) redirect("/login");

  const forum = await getForumBySlug(slug);
  if (!forum) redirect("/portal/reporter");

  let ctx;
  try {
    ctx = await assertReporterAccess(forum.id);
  } catch {
    redirect("/portal/reporter");
  }

  const isPrimary =
    ctx.isAdmin || forum.reporter_assignments.some((r) => r.reporter_type === "primary" && r.member_id === ctx.userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {isPrimary && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Reporters</h2>
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
      )}
      <ForumReportView slug={slug} />
    </div>
  );
}
