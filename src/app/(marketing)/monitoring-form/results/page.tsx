import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChartCard, StatTile } from "@/components/admin/july-trends/ChartCard";
import { BarTrend, PieTrend } from "@/components/admin/july-trends/TrendCharts";
import { listVerifiedMonitoringSummary } from "@/lib/monitoring-form-public-summary";

export const metadata = {
  title: "July Monitoring Form — Results",
  description: "Public, verified-only results of the July Monitoring Form.",
};

export default async function MonitoringFormResultsPage() {
  const result = await listVerifiedMonitoringSummary();

  return (
    <>
      <PageHeader
        title="July Monitoring Results"
        description="Verified campus reports only. Contact details, evidence files, and unverified names of trustees or administrators are never published."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Monitoring Form", href: "/monitoring-form" },
          { label: "Results" },
        ]}
        tone="pattern"
      />
      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer>
          {!result.ok ? (
            <EmptyState title="Unable to load results" description={result.message} />
          ) : result.summary.totalVerified === 0 ? (
            <EmptyState title="No verified reports yet" description="Check back soon as reports are reviewed." />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Verified responses" value={result.summary.totalVerified} />
                <StatTile label="Universities" value={result.summary.totalUniversities} />
                {result.summary.byProgramStatus.map((s) => (
                  <StatTile key={s.name} label={s.name} value={s.value} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartCard title="July 2026 status" subtitle="Verified reports by programme status">
                  <BarTrend data={result.summary.byProgramStatus} horizontal />
                </ChartCard>
                <ChartCard title="Admin/trustee support category" subtitle="Verified reports by scored category">
                  <PieTrend data={result.summary.byCategory} />
                </ChartCard>
              </div>

              <div>
                <h2 className="text-h4 font-semibold text-[color:var(--color-text)]">University-wise</h2>
                <div className="mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)]">
                  <table className="w-full text-left text-small">
                    <thead className="bg-[color:var(--color-surface-2)]">
                      <tr>
                        <th className="px-4 py-2 font-semibold">University</th>
                        <th className="px-4 py-2 font-semibold">Status</th>
                        <th className="px-4 py-2 font-semibold">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.summary.universities.map((u, i) => (
                        <tr key={`${u.universityName}-${i}`} className="border-t border-[color:var(--color-border)]">
                          <td className="px-4 py-2">{u.universityName}</td>
                          <td className="px-4 py-2">{u.programStatus}</td>
                          <td className="px-4 py-2">{u.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </MarketingContainer>
      </Section>
    </>
  );
}
