import type { Metadata } from "next";
import { listBloodHeroMatchesForAdmin } from "@/actions/bloodhero-admin-matches";
import { BloodHeroAdminMatchesContent } from "@/components/bloodhero/admin/BloodHeroAdminMatchesContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "Matches",
  description: "Accepted donor-request pairings for BloodHero.",
};

export default async function BloodHeroAdminMatchesPage() {
  const { matches, error } = await listBloodHeroMatchesForAdmin();

  return <BloodHeroAdminMatchesContent paths={bloodHeroAdminUrls("/bloodhero/admin")} matches={matches} error={error} />;
}
