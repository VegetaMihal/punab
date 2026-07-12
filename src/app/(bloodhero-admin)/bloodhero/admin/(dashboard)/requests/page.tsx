import type { Metadata } from "next";
import {
  listBloodHeroRequestsForAdmin,
  type BloodHeroRequestStatusFilter,
} from "@/actions/bloodhero-admin-requests";
import { BloodHeroAdminRequestsContent } from "@/components/bloodhero/admin/BloodHeroAdminRequestsContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "Requests",
  description: "Review and manage BloodHero blood requests.",
};

function safeFilter(v?: string): BloodHeroRequestStatusFilter {
  if (v === "open" || v === "matching" || v === "fulfilled" || v === "closed") return v;
  return "all";
}

export default async function BloodHeroAdminRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const raw = params.status;
  const selected = safeFilter(typeof raw === "string" ? raw : undefined);
  const { requests, error } = await listBloodHeroRequestsForAdmin(selected);

  return (
    <BloodHeroAdminRequestsContent
      paths={bloodHeroAdminUrls("/bloodhero/admin")}
      selected={selected}
      requests={requests}
      error={error}
    />
  );
}
