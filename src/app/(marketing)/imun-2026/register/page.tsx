import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { MunApplicationForm } from "@/components/marketing/MunApplicationForm";

export const metadata = {
  title: "Delegate Application — PUNAB IMUN 2026",
  description: "Apply as a delegate for PUNAB International Model United Nations Conference 2026.",
};

export default function ImunRegisterPage() {
  return (
    <>
      <PageHeader
        title="Delegate Application Form"
        description="PUNAB IMUN 2026 — complete every section below. Registration is confirmed only after payment is verified."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "PUNAB IMUN 2026", href: "/imun-2026" },
          { label: "Apply" },
        ]}
        tone="pattern"
      />
      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer>
          <MunApplicationForm />
        </MarketingContainer>
      </Section>
    </>
  );
}
