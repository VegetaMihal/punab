import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadershipLayerForm } from "@/components/admin/LeadershipLayerForm";
import { Card } from "@/components/ui/Card";
import { getLeadershipLayerAdmin } from "@/lib/repositories/leadership-repository";

export const metadata = {
  title: "Edit leadership layer",
};

export default async function EditLeadershipLayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const layer = await getLeadershipLayerAdmin(id);
  if (!layer) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/leadership/layers" className="text-sm text-accent hover:underline">
        ← Leadership layers
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit leadership layer</h1>
      <Card className="mt-8 max-w-xl">
        <LeadershipLayerForm layer={layer} />
      </Card>
    </div>
  );
}
