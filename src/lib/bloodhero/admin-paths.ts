import { revalidatePath } from "next/cache";

/** Standalone BloodHero coordinator UI (PUNAB admin or bloodhero_admin_access). */
export const BLOODHERO_ADMIN_STANDALONE_ROOT = "/bloodhero/admin" as const;

/** BloodHero tools embedded in PUNAB `/admin` (PUNAB `profiles.role = admin` only). */
export const BLOODHERO_ADMIN_PUNAB_ROOT = "/admin/bloodhero" as const;

export type BloodHeroAdminRoot =
  | typeof BLOODHERO_ADMIN_STANDALONE_ROOT
  | typeof BLOODHERO_ADMIN_PUNAB_ROOT;

export function bloodHeroAdminUrls(root: BloodHeroAdminRoot) {
  const base = root;
  return {
    root: base,
    pendingDonors: `${base}/pending-donors`,
    requests: `${base}/requests`,
    requestDetail: (id: string) => `${base}/requests/${id}`,
    requestsWithStatus: (status: string) =>
      status === "all" ? `${base}/requests` : `${base}/requests?status=${status}`,
  };
}

export type BloodHeroAdminUrls = ReturnType<typeof bloodHeroAdminUrls>;

const BOTH_ROOTS = [BLOODHERO_ADMIN_STANDALONE_ROOT, BLOODHERO_ADMIN_PUNAB_ROOT] as const;

export function revalidateBloodHeroAdminPendingDonorsAndOverview() {
  for (const base of BOTH_ROOTS) {
    revalidatePath(`${base}/pending-donors`);
    revalidatePath(base);
  }
}

export function revalidateBloodHeroAdminRequestsAndOverview() {
  for (const base of BOTH_ROOTS) {
    revalidatePath(`${base}/requests`);
    revalidatePath(base);
  }
}

export function revalidateBloodHeroAdminRequestDetail(requestId: string) {
  for (const base of BOTH_ROOTS) {
    revalidatePath(`${base}/requests/${requestId}`);
  }
}
