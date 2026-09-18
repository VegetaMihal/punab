import { ForumReportView } from "@/components/org/ForumReportView";
import { assertAdminScope } from "@/lib/auth/require-admin";

export const metadata = { title: "Monthly report — Org Portal" };

export default async function AdminForumReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await assertAdminScope("org_portal");
  return <ForumReportView slug={slug} />;
}
