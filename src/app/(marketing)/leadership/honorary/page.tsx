export const revalidate = 120;

import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadershipSections } from "@/components/leadership/LeadershipSections";
import { HONORARY_POSITION_PAGE_TITLE, honoraryPublicPageTitle } from "@/lib/leadership-constants";
import { getPublishedHonoraryLeadership } from "@/lib/repositories/leadership-repository";
import type { LeadershipLayer, LeadershipMember } from "@/types/database";

export const metadata = {
  title: HONORARY_POSITION_PAGE_TITLE,
};

export default async function HonoraryLeadershipPage() {
  let layerRows: LeadershipLayer[] = [];
  let memberRows: LeadershipMember[] = [];
  let loadError: string | null = null;
  try {
    const data = await getPublishedHonoraryLeadership();
    layerRows = data.layers;
    memberRows = data.members;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Error";
  }

  const sectionData = layerRows
    .map((layer) => ({
      layer,
      members: memberRows.filter((m) => m.layer_id === layer.id),
    }))
    .filter((s) => s.members.length > 0);
  const honoraryLayer = layerRows[0];
  const pageTitle = honoraryPublicPageTitle(honoraryLayer?.title);
  const pageDescription = honoraryLayer?.description || "Distinguished honorary roles and advisors.";

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Leadership", href: "/leadership" },
          { label: HONORARY_POSITION_PAGE_TITLE },
        ]}
      />
      <MarketingContainer className="py-12 md:py-16">
        <LeadershipSections
          sectionData={sectionData}
          loadError={loadError}
          errorTitle="Unable to load honorary positions"
          emptyTitle="No honorary positions published"
          emptyDescription="When the Honorary Position layer and members are published in the admin panel, they will appear here."
          omitLayerHeaders
        />
      </MarketingContainer>
    </>
  );
}
