import type { Metadata } from "next";
import {
  getBloodHeroRequestDetailForAdmin,
  listBloodHeroAcceptedNotificationsForRequest,
} from "@/actions/bloodhero-admin-requests";
import { BloodHeroAdminRequestDetailContent } from "@/components/bloodhero/admin/BloodHeroAdminRequestDetailContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "BloodHero — Request detail",
};

export default async function AdminBloodHeroRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const { request, events, error, eventsError } = await getBloodHeroRequestDetailForAdmin(requestId);
  const { notifications: accepted } = await listBloodHeroAcceptedNotificationsForRequest(requestId);

  return (
    <BloodHeroAdminRequestDetailContent
      paths={bloodHeroAdminUrls("/admin/bloodhero")}
      request={request}
      events={events}
      error={error}
      eventsError={eventsError}
      accepted={accepted}
    />
  );
}
