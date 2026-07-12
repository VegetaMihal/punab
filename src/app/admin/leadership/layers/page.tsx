import Link from "next/link";
import { DeleteLeadershipLayerButton } from "@/components/admin/DeleteLeadershipLayerButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { isHonoraryLeadershipSlug } from "@/lib/leadership-constants";
import { listLeadershipLayersAdminFull } from "@/lib/repositories/leadership-repository";
import type { LeadershipLayer } from "@/types/database";

export const metadata = {
  title: "Leadership layers",
};

export default async function LeadershipLayersPage() {
  let layers: LeadershipLayer[] = [];
  let error: string | null = null;
  try {
    layers = await listLeadershipLayersAdminFull();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Leadership layers</h1>
          <p className="mt-1 text-sm text-muted">Manage sections shown on the public leadership page.</p>
        </div>
        <Link
          href="/admin/leadership/layers/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New layer
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && layers.length === 0 && (
          <EmptyState title="No layers" description="Create at least one layer for leadership members." />
        )}
        {!error &&
          layers.map((layer) => (
            <div
              key={layer.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link
                  href={`/admin/leadership/layers/${layer.id}`}
                  className="font-medium text-stone-900 hover:underline dark:text-stone-50"
                >
                  {layer.title}
                </Link>
                <p className="text-xs text-muted">
                  {layer.slug} · sort {layer.sort_order} · {layer.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <DeleteLeadershipLayerButton
                id={layer.id}
                disabledReason={
                  isHonoraryLeadershipSlug(layer.slug)
                    ? "Reserved for the public Honorary Position page."
                    : undefined
                }
              />
            </div>
          ))}
      </div>
    </div>
  );
}
