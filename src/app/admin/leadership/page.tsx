import Link from "next/link";
import { DeleteLeadershipButton } from "@/components/admin/DeleteLeadershipButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { listLeadershipLayerOptions, listLeadershipMembersAdmin } from "@/lib/repositories/leadership-repository";
import type { LeadershipMember } from "@/types/database";

export const metadata = {
  title: "Executive leadership",
};

export default async function AdminLeadershipPage() {
  let members: LeadershipMember[] = [];
  let layerMap: Record<string, string> = {};
  let error: string | null = null;
  try {
    const [m, layers] = await Promise.all([listLeadershipMembersAdmin(), listLeadershipLayerOptions()]);
    members = m;
    layerMap = Object.fromEntries(layers.map((l) => [l.id, l.title]));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Executive leadership</h1>
          <p className="mt-1 text-sm text-muted">
            Members are grouped by layers on the public executive leadership page. Honorary profiles use the reserved{" "}
            <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">honorary</code> layer — manage them under{" "}
            <Link href="/admin/leadership/honorary" className="text-accent hover:underline">
              Honorary Position
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/leadership/layers"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Manage layers
          </Link>
          <Link
            href="/admin/leadership/new"
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
          >
            Add member
          </Link>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && members.length === 0 && <EmptyState title="No entries" description="Add leadership profiles." />}
        {!error &&
          members.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link
                  href={`/admin/leadership/${m.id}`}
                  className="font-medium text-stone-900 hover:underline dark:text-stone-50"
                >
                  {m.name}
                </Link>
                <p className="text-xs text-muted">
                  {m.position} · {m.layer_id ? layerMap[m.layer_id] ?? "Unassigned" : "Unassigned"} ·{" "}
                  {m.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <DeleteLeadershipButton id={m.id} />
            </div>
          ))}
      </div>
    </div>
  );
}
