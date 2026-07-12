import { JulyTeacherHonorNominationForm } from "@/components/marketing/JulyTeacherHonorNominationForm";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import {
  isJulyTeacherHonorSheetsConfigured,
  JULY_TEACHER_HONOR_DEFAULT_TAB,
} from "@/lib/july-teacher-honor-google-sheet";

export const metadata = {
  title: "Teacher honor nomination · July Award 2026",
  description:
    "Nominate a faculty member for the July Uprising Teacher Honor — remembrance programme 2026.",
};

export default function JulyTeacherHonorNominatePage() {
  const sheetsReady = isJulyTeacherHonorSheetsConfigured();

  return (
    <>
      <PageHeader
        title="July Uprising Teacher Honor Nomination 2026"
        description="Recognize educators who stood with students during the July Uprising — through protection, guidance, courage, and humanity. Submissions go to a dedicated spreadsheet (separate from club applications)."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "July Award 2026", href: "/july-award-2026" },
          { label: "Teacher honor nomination" },
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
              This form is disabled until the teacher-honor spreadsheet is configured: set{" "}
              <code className="rounded bg-[color:var(--color-surface-2)] px-1">JULY_TEACHER_HONOR_GOOGLE_SHEET_ID</code>{" "}
              (a spreadsheet <strong className="font-semibold">different</strong> from the club award sheet). Optional:{" "}
              <code className="rounded bg-[color:var(--color-surface-2)] px-1">JULY_TEACHER_HONOR_SHEET_TAB</code>{" "}
              (defaults to <code className="rounded bg-[color:var(--color-surface-2)] px-1">{JULY_TEACHER_HONOR_DEFAULT_TAB}</code>
              ). Use the same Google service account as other July forms and share the new spreadsheet with it as Editor.
            </div>
          )}

          <div className="mb-10 max-w-3xl space-y-4 text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
            <p>
              We are organizing a remembrance programme to honor teachers who courageously stood beside students during
              the July Uprising and played a significant role in protecting, supporting, guiding, or inspiring students in
              difficult moments.
            </p>
            <p>
              Through this nomination process, we aim to recognize outstanding educators whose actions reflected
              courage, humanity, leadership, and dedication. Please complete the form carefully; submissions are reviewed
              confidentially by the evaluation committee.
            </p>
            <p className="font-medium text-[color:var(--color-text)]">Thank you for contributing to this remembrance initiative.</p>
          </div>

          <JulyTeacherHonorNominationForm />

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
