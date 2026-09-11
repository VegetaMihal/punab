import Link from "next/link";
import { listPendingApplications } from "@/lib/repositories/org-promotions-repository";
import { PromotionDecisionForm } from "@/components/org/PromotionDecisionForm";

export const metadata = { title: "Promotions — Org Portal" };

export default async function PromotionsPage() {
  const applications = await listPendingApplications();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Promotion requests</h1>
      <p className="mb-6 text-sm text-muted">People asking to move up to the next level in their Forum.</p>
      {applications.length === 0 ? (
        <p className="text-sm text-muted">Nothing waiting for a decision right now.</p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
          {applications.map((a) => (
            <li key={a.id} className="space-y-2 px-4 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{a.member.full_name}</span>
                <Link href={`/portal/admin/forums/${a.forum.slug}`} className="text-brand-green hover:underline">
                  {a.forum.name}
                </Link>
              </div>
              <p className="text-muted">
                {a.currentLevelLabel} → {a.targetLevelLabel} · applied {a.applied_at.toLocaleDateString()}
              </p>
              <PromotionDecisionForm applicationId={a.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
