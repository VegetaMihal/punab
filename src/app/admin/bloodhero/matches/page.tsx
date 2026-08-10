import type { Metadata } from "next";
import { listBloodHeroMatchesForAdmin } from "@/actions/bloodhero-admin-matches";
import { BloodHeroAdminMatchesContent } from "@/components/bloodhero/admin/BloodHeroAdminMatchesContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "BloodHero — Matches",
};

export default async function AdminBloodHeroMatchesPage() {
  const { matches, error } = await listBloodHeroMatchesForAdmin();

  return <BloodHeroAdminMatchesContent paths={bloodHeroAdminUrls("/admin/bloodhero")} matches={matches} error={error} />;
}
