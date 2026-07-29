import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { MonitoringForm } from "@/components/marketing/MonitoringForm";
import { listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";

export const metadata = {
  title: "July Monitoring Form",
  description: "Report the status of the July programme on your campus.",
};

export default async function MonitoringFormPage() {
  const universities = await listUniversitiesForOptions().catch(() => []);

  return (
    <>
      <PageHeader
        title="July Monitoring Form"
        description="Help PUNAB track how universities across the country are observing July 2026. Reports are reviewed and verified before any publication."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Monitoring Form" }]}
        tone="pattern"
      />
      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer>
          <MonitoringForm universities={universities} />
        </MarketingContainer>
      </Section>
    </>
  );
}
