import Link from "next/link";
import { BloodHeroDonorAutoApprovalToggle } from "@/components/bloodhero/BloodHeroDonorAutoApprovalToggle";
import { BloodHeroPendingDonorRowActions } from "@/components/bloodhero/BloodHeroPendingDonorRowActions";
import type { BloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";
import type { PendingDonorRow } from "@/actions/bloodhero-admin-donors";

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function BloodHeroAdminPendingDonorsContent({
  paths,
  donors,
  error,
  autoApproval,
}: {
  paths: BloodHeroAdminUrls;
  donors: PendingDonorRow[];
  error?: string;
  autoApproval: {
    enabled: boolean;
    available: boolean;
    error?: string;
  };
}) {
  if (error === "Unauthorized" || autoApproval.error === "Unauthorized") {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">You do not have access to this page.</p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pending donors
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Registrations awaiting review. Approve to set status to <strong>active</strong>, or reject.
          </p>
        </div>
        <Link
          href={paths.root}
          className="text-sm font-medium text-red-800 hover:underline dark:text-red-300"
        >
          ← Admin overview
        </Link>
      </div>

      <BloodHeroDonorAutoApprovalToggle
        enabled={autoApproval.enabled}
        disabled={!autoApproval.available}
      />
      {autoApproval.error && autoApproval.error !== "Unauthorized" && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          {autoApproval.error}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          {error}
        </div>
      )}

      {!error && donors.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
          No pending donors right now.
        </p>
      )}

      {!error && donors.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Blood group</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {donors.map((d) => (
                <tr key={d.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{d.full_name}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{d.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300">{d.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300">{d.blood_group}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{d.district}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {formatCreatedAt(d.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <BloodHeroPendingDonorRowActions donorId={d.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
