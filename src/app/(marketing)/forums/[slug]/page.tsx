export const revalidate = 60;

import { notFound } from "next/navigation";
import { ForumSections, type ForumSectionGroup } from "@/components/forums/ForumSections";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedForumBySlug } from "@/lib/repositories/forums-repository";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { forum } = await getPublishedForumBySlug(slug);
  return { title: forum?.title ?? "Forum" };
}

export default async function ForumPublicPage({ params }: Props) {
  const { slug } = await params;
  let forumTitle = "";
  let forumDescription: string | null = null;
  let sectionData: ForumSectionGroup[] = [];
  let loadError: string | null = null;
  try {
    const data = await getPublishedForumBySlug(slug);
    if (!data.forum) {
      notFound();
    }
    forumTitle = data.forum.title;
    forumDescription = data.forum.description;
    sectionData = data.labels
      .map((label) => ({
        label,
        members: data.members.filter((m) => m.label_id === label.id),
      }))
      .filter((s) => s.members.length > 0);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Error";
  }

  return (
    <>
      <PageHeader
        title={forumTitle || "Forum"}
        description={
          forumDescription ??
          "Forum moderators and representatives, organised by section."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Wings" },
          { label: "Forums", href: "/forums" },
          { label: forumTitle || "Forum" },
        ]}
      />
      <MarketingContainer className="py-12 md:py-16">
        <ForumSections
          sectionData={sectionData}
          loadError={loadError}
          errorTitle="Unable to load forum"
          emptyTitle="No published profiles yet"
          emptyDescription="There are no profiles to show for this forum yet."
        />
      </MarketingContainer>
    </>
  );
}
