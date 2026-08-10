import Link from "next/link";
import type {
  BloodHeroAdminNotificationRow,
  BloodHeroNotificationStatusFilter,
} from "@/actions/bloodhero-admin-notifications";
import type { BloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

const filters: BloodHeroNotificationStatusFilter[] = ["all", "pending", "accepted", "declined", "expired"];

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function statusFilterHref(paths: BloodHeroAdminUrls, f: BloodHeroNotificationStatusFilter): string {
  return f === "all" ? paths.notifications : `${paths.notifications}?status=${f}`;
}

export function BloodHeroAdminNotificationsContent({
  paths,
  selected,
  notifications,
  error,
}: {
  paths: BloodHeroAdminUrls;
  selected: BloodHeroNotificationStatusFilter;
  notifications: BloodHeroAdminNotificationRow[];
  error?: string;
}) {
  if (error === "Unauthorized") {
    return <p className="text-sm text-red-600 dark:text-red-400">You do not have access to this page.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Queued donor outreach for blood requests and delivery/response status.
          </p>
        </div>
        <Link href={paths.root} className="text-sm font-medium text-red-800 hover:underline dark:text-red-300">
          ← Admin overview
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = selected === f;
          return (
            <Link
              key={f}
              href={statusFilterHref(paths, f)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                active
                  ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {f}
            </Link>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          {error}
        </div>
      )}

      {!error && notifications.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
          No notifications found for this filter.
        </p>
      )}

      {!error && notifications.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Blood</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Queued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {notifications.map((n) => (
                <tr key={n.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={paths.requestDetail(n.request_id)}
                      className="font-mono text-xs text-red-800 hover:underline dark:text-red-300"
                    >
                      {n.request_tracking_number ?? n.request_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    {n.request_blood_group ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{n.request_district ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {n.donor_full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    {n.donor_phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {formatDateTime(n.sent_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {n.response_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {formatDateTime(n.created_at)}
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
