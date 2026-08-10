import type { Metadata } from "next";
import { listActiveDonorsForAdmin } from "@/actions/bloodhero-admin-donors";
import { BloodHeroAdminActiveDonorsContent } from "@/components/bloodhero/admin/BloodHeroAdminActiveDonorsContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "Active donors",
  description: "Approved BloodHero donors eligible for matching.",
};

export default async function BloodHeroAdminActiveDonorsPage() {
  const { donors, error } = await listActiveDonorsForAdmin();

  return (
    <BloodHeroAdminActiveDonorsContent paths={bloodHeroAdminUrls("/bloodhero/admin")} donors={donors} error={error} />
  );
}
