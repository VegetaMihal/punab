import Link from "next/link";
import { getCentralDashboardSummary } from "@/lib/repositories/org-dashboard-repository";

export const metadata = { title: "Central dashboard — Org Portal" };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-stone-200 p-4 dark:border-stone-800">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-100">{value}</p>
    </div>
  );
}

export default async function CentralDashboardPage() {
  const s = await getCentralDashboardSummary();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          Central dashboard — {MONTH_NAMES[s.month - 1]} {s.year}
        </h1>
        <Link href="/portal/admin/forums" className="text-sm text-brand-green hover:underline">
          View all Forums →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Forums" value={s.totalForums} />
        <StatCard label="Still starting out" value={s.incompleteCount} />
        <StatCard label="Fully recognized" value={s.fullCount} />
        <StatCard label="Average member score" value={s.averageMemberPerformance !== null ? s.averageMemberPerformance!.toFixed(0) : "No scores yet"} />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">This month&apos;s reports</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Still writing" value={s.statusCounts.draft} />
          <StatCard label="Submitted" value={s.statusCounts.submitted} />
          <StatCard label="Submitted late" value={s.statusCounts.late_submitted} />
          <StatCard label="Reopened" value={s.statusCounts.reopened} />
          <StatCard label="Resubmitted" value={s.statusCounts.resubmitted} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Forums that haven&apos;t started a report yet</h2>
        {s.forumsMissingReport.length === 0 ? (
          <p className="text-sm text-muted">None — every Forum has started this month&apos;s report.</p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {s.forumsMissingReport.map((f) => (
              <li key={f.id} className="px-4 py-2 text-sm">
                <Link href={`/portal/admin/forums/${f.slug}`} className="text-brand-green hover:underline">{f.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Ready to become Full Forums</h2>
        {s.eligibleForFull.length === 0 ? (
          <p className="text-sm text-muted">None ready right now.</p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {s.eligibleForFull.map((f) => (
              <li key={f.id} className="px-4 py-2 text-sm">
                <Link href={`/portal/admin/forums/${f.slug}`} className="text-brand-green hover:underline">{f.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Forums missing a Secretary or Convenor</h2>
        {s.vacancies.length === 0 ? (
          <p className="text-sm text-muted">All Full Forums have both positions filled.</p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
            {s.vacancies.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                <Link href={`/portal/admin/forums/${f.slug}`} className="text-brand-green hover:underline">{f.name}</Link>
                <span className="text-muted">
                  {!f.secretaryFilled && "No Secretary "}
                  {!f.convenorFilled && "No Convenor "}
                  · {f.moderatorPlusCount} senior members
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
