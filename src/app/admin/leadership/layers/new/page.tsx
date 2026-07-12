import Link from "next/link";
import { LeadershipLayerForm } from "@/components/admin/LeadershipLayerForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "New leadership layer",
};

export default function NewLeadershipLayerPage() {
  return (
    <div>
      <Link href="/admin/leadership/layers" className="text-sm text-accent hover:underline">
        ← Leadership layers
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New leadership layer</h1>
      <Card className="mt-8 max-w-xl">
        <LeadershipLayerForm />
      </Card>
    </div>
  );
}
