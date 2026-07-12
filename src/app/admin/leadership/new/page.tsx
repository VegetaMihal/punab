import Link from "next/link";
import { LeadershipForm } from "@/components/admin/LeadershipForm";
import { Card } from "@/components/ui/Card";
import { HONORARY_LEADERSHIP_LAYER_SLUG, isHonoraryLeadershipSlug } from "@/lib/leadership-constants";
import { ensureHonoraryLeadershipLayerAdmin, listLeadershipLayerOptions } from "@/lib/repositories/leadership-repository";

export const metadata = {
  title: "New leadership",
};

type SearchParams = { layerId?: string; honorary?: string };

export default async function NewLeadershipPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const fromHonoraryFlow = sp.honorary === "1" || sp.honorary === "true";

  if (fromHonoraryFlow) {
    await ensureHonoraryLeadershipLayerAdmin();
  }

  const layers = await listLeadershipLayerOptions();
  const honoraryLayerId = layers.find((l) => l.slug === HONORARY_LEADERSHIP_LAYER_SLUG)?.id;

  const defaultLayerId =
    sp.layerId && layers.some((l) => l.id === sp.layerId)
      ? sp.layerId
      : fromHonoraryFlow && honoraryLayerId
        ? honoraryLayerId
        : undefined;

  const defaultLayer = defaultLayerId ? layers.find((l) => l.id === defaultLayerId) : undefined;
  const isHonoraryMemberContext = Boolean(defaultLayer && isHonoraryLeadershipSlug(defaultLayer.slug));
  const backHref = fromHonoraryFlow || isHonoraryMemberContext ? "/admin/leadership/honorary" : "/admin/leadership";
  const backLabel = fromHonoraryFlow || isHonoraryMemberContext ? "← Honorary Position" : "← Executive leadership";
  const title = fromHonoraryFlow || isHonoraryMemberContext ? "Add honorary member" : "Add leadership member";

  return (
    <div>
      <Link href={backHref} className="text-sm text-accent hover:underline">
        {backLabel}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">{title}</h1>
      <Card className="mt-8 max-w-xl">
        <LeadershipForm layers={layers} defaultLayerId={defaultLayerId} />
      </Card>
    </div>
  );
}
