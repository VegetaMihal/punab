import type { Metadata } from "next";
import { BloodHeroAdminOverviewContent } from "@/components/bloodhero/admin/BloodHeroAdminOverviewContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function BloodHeroAdminDashboardPage() {
  return (
    <BloodHeroAdminOverviewContent
      paths={bloodHeroAdminUrls("/bloodhero/admin")}
      variant="standalone"
    />
  );
}
