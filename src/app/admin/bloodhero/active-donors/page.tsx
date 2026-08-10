import type { Metadata } from "next";
import { listActiveDonorsForAdmin } from "@/actions/bloodhero-admin-donors";
import { BloodHeroAdminActiveDonorsContent } from "@/components/bloodhero/admin/BloodHeroAdminActiveDonorsContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "BloodHero — Active donors",
};

export default async function AdminBloodHeroActiveDonorsPage() {
  const { donors, error } = await listActiveDonorsForAdmin();

  return (
    <BloodHeroAdminActiveDonorsContent paths={bloodHeroAdminUrls("/admin/bloodhero")} donors={donors} error={error} />
  );
}
