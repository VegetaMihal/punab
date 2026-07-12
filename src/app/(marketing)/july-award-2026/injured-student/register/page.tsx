import { JulyInjuredStudentRegistrationForm } from "@/components/marketing/JulyInjuredStudentRegistrationForm";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import {
  isJulyInjuredStudentSheetsConfigured,
  JULY_INJURED_STUDENT_DEFAULT_TAB,
} from "@/lib/july-injured-student-google-sheet";

export const metadata = {
  title: "Injured student registration · July Award 2026",
  description: "Register for recognition in the July Uprising Memorial programme — PUNAB will contact you to confirm.",
};

export default function JulyInjuredStudentRegisterPage() {
  const sheetsReady = isJulyInjuredStudentSheetsConfigured();

  return (
    <>
      <PageHeader
        title="Register as an injured student"
        description="We will call you on the number you provide to confirm your details. Information is handled carefully and reviewed privately."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "July Award 2026", href: "/july-award-2026" },
          { label: "Injured student registration" },
        ]}
        tone="pattern"
      />

      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer>
          {!sheetsReady && (
            <div
              className="mb-8 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-4 py-3 text-small text-[color:var(--color-error)]"
              role="status"
            >
              Set <code className="rounded bg-[color:var(--color-surface-2)] px-1">JULY_INJURED_STUDENT_GOOGLE_SHEET_ID</code>{" "}
              (separate spreadsheet). Optional:{" "}
              <code className="rounded bg-[color:var(--color-surface-2)] px-1">JULY_INJURED_STUDENT_SHEET_TAB</code> (default{" "}
              <code className="rounded bg-[color:var(--color-surface-2)] px-1">{JULY_INJURED_STUDENT_DEFAULT_TAB}</code>
              ). Same Google service account as other July forms; share the sheet as Editor.
            </div>
          )}

          <JulyInjuredStudentRegistrationForm />

          <p className="mt-10 text-center">
            <Button href="/july-award-2026" variant="ghost" size="md">
              ← July Award 2026
            </Button>
          </p>
        </MarketingContainer>
      </Section>
    </>
  );
}
