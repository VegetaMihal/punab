import type { Metadata } from "next";
import { getDonorAutoApprovalForAdmin, listPendingDonorsForAdmin } from "@/actions/bloodhero-admin-donors";
import { BloodHeroAdminPendingDonorsContent } from "@/components/bloodhero/admin/BloodHeroAdminPendingDonorsContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "Pending donors",
  description: "Review BloodHero donor registrations with status pending.",
};

export default async function BloodHeroAdminPendingDonorsPage() {
  const [{ donors, error }, autoApproval] = await Promise.all([
    listPendingDonorsForAdmin(),
    getDonorAutoApprovalForAdmin(),
  ]);
  return (
    <BloodHeroAdminPendingDonorsContent
      paths={bloodHeroAdminUrls("/bloodhero/admin")}
      donors={donors}
      error={error}
      autoApproval={autoApproval}
    />
  );
}
