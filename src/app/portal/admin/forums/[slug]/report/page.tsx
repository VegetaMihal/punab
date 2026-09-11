import { ForumReportView } from "@/components/org/ForumReportView";

export const metadata = { title: "Monthly report — Org Portal" };

export default async function AdminForumReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ForumReportView slug={slug} />;
}
