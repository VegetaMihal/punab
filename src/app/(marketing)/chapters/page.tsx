export const revalidate = 60;

import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Chapters",
};

export default function ChaptersPage() {
  return (
    <>
      <PageHeader
        title="University chapters"
        description="Recognised chapters that carry PUNAB's work on campus and link members to the national body."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Wings" }, { label: "Chapters" }]}
      />
      <MarketingContainer className="py-12 md:py-16">
        <Reveal>
          <div className="mx-auto max-w-lg rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-8 py-12 text-center shadow-[var(--shadow-sm)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand)]">Coming soon</p>
            <p className="text-body mt-3 text-[color:var(--color-text-muted)]">
              The chapters directory is not live yet. We are preparing listings and will publish them here when ready.
            </p>
          </div>
        </Reveal>
      </MarketingContainer>
    </>
  );
}
