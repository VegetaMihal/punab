import type { Metadata } from "next";
import { getDonorAutoApprovalForAdmin, listPendingDonorsForAdmin } from "@/actions/bloodhero-admin-donors";
import { BloodHeroAdminPendingDonorsContent } from "@/components/bloodhero/admin/BloodHeroAdminPendingDonorsContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "BloodHero — Pending donors",
};

export default async function AdminBloodHeroPendingDonorsPage() {
  const [{ donors, error }, autoApproval] = await Promise.all([
    listPendingDonorsForAdmin(),
    getDonorAutoApprovalForAdmin(),
  ]);

  return (
    <BloodHeroAdminPendingDonorsContent
      paths={bloodHeroAdminUrls("/admin/bloodhero")}
      donors={donors}
      error={error}
      autoApproval={autoApproval}
    />
  );
}
