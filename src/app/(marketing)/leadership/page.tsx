export const revalidate = 120;

import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadershipSections } from "@/components/leadership/LeadershipSections";
import { getPublishedExecutiveLeadership } from "@/lib/repositories/leadership-repository";
import type { LeadershipLayer, LeadershipMember } from "@/types/database";

export const metadata = {
  title: "Executive Leadership",
};

export default async function LeadershipPage() {
  let layerRows: LeadershipLayer[] = [];
  let memberRows: LeadershipMember[] = [];
  let loadError: string | null = null;
  try {
    const data = await getPublishedExecutiveLeadership();
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

  return (
    <>
      <PageHeader
        title="Executive Leadership"
        description="National office-bearers and executive members by leadership layer."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Leadership" }]}
      />
      <MarketingContainer className="py-12 md:py-16">
        <LeadershipSections
          sectionData={sectionData}
          loadError={loadError}
          errorTitle="Unable to load executive leadership"
          emptyTitle="No executive leadership published"
          emptyDescription="Sections and profiles will appear here when leadership layers and members are published in the admin panel."
        />
      </MarketingContainer>
    </>
  );
}
