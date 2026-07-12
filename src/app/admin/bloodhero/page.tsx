import type { Metadata } from "next";
import { BloodHeroAdminOverviewContent } from "@/components/bloodhero/admin/BloodHeroAdminOverviewContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "BloodHero",
};

export default function AdminBloodHeroOverviewPage() {
  return (
    <BloodHeroAdminOverviewContent paths={bloodHeroAdminUrls("/admin/bloodhero")} variant="punab" />
  );
}
