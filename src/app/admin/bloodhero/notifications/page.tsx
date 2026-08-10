import type { Metadata } from "next";
import {
  listBloodHeroNotificationsForAdmin,
  type BloodHeroNotificationStatusFilter,
} from "@/actions/bloodhero-admin-notifications";
import { BloodHeroAdminNotificationsContent } from "@/components/bloodhero/admin/BloodHeroAdminNotificationsContent";
import { bloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

export const metadata: Metadata = {
  title: "BloodHero — Notifications",
};

function safeFilter(v?: string): BloodHeroNotificationStatusFilter {
  if (v === "pending" || v === "accepted" || v === "declined" || v === "expired") return v;
  return "all";
}

export default async function AdminBloodHeroNotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const raw = params.status;
  const selected = safeFilter(typeof raw === "string" ? raw : undefined);
  const { notifications, error } = await listBloodHeroNotificationsForAdmin(selected);

  return (
    <BloodHeroAdminNotificationsContent
      paths={bloodHeroAdminUrls("/admin/bloodhero")}
      selected={selected}
      notifications={notifications}
      error={error}
    />
  );
}
