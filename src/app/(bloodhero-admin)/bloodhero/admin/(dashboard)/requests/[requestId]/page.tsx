import type { Metadata } from "next";
import { getBloodHeroRequestDetailForAdmin } from "@/actions/bloodhero-admin-requests";
import { BloodHeroAdminRequestDetailContent } from "@/components/bloodhero/admin/BloodHeroAdminRequestDetailContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "Request detail",
  description: "Inspect one BloodHero blood request and its timeline.",
};

export default async function BloodHeroAdminRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const { request, events, error, eventsError } = await getBloodHeroRequestDetailForAdmin(requestId);

  return (
    <BloodHeroAdminRequestDetailContent
      paths={bloodHeroAdminUrls("/bloodhero/admin")}
      request={request}
      events={events}
      error={error}
      eventsError={eventsError}
    />
  );
}
