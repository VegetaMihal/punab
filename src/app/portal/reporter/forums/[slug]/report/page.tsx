import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { assertReporterAccess } from "@/lib/auth/require-reporter";
import { getForumBySlug } from "@/lib/repositories/org-forums-repository";
import { ForumReportView } from "@/components/org/ForumReportView";

export const metadata = { title: "Monthly report — Reporter Portal" };

export default async function ReporterForumReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user } = await getSessionProfile();
  if (!user) redirect("/login");

  const forum = await getForumBySlug(slug);
  if (!forum) redirect("/portal/reporter");

  try {
    await assertReporterAccess(forum.id);
  } catch {
    redirect("/portal/reporter");
  }

  return <ForumReportView slug={slug} />;
}
