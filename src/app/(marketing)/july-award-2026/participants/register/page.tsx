import { JulyParticipantRegistrationForm } from "@/components/marketing/JulyParticipantRegistrationForm";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import {
  isJulyParticipantSheetsConfigured,
  JULY_PARTICIPANT_DEFAULT_TAB,
} from "@/lib/july-participant-google-sheet";

export const metadata = {
  title: "Participant registration · July Award 2026",
  description: "Register to attend the July Uprising Memorial Award programme.",
};

// Temporary: paused while fixing a sheet-append bug that misaligned some rows. Flip to false once fixed & verified.
const MAINTENANCE_MODE = true;

function MaintenanceNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-10 w-10 text-(--color-primary)"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.043 3.685-4.155-4.155m0 0-3.35-3.35a2.652 2.652 0 0 0-3.75 0l-.6.6a2.652 2.652 0 0 0 0 3.75l3.35 3.35m4.35-4.35 4.155 4.155"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-(--color-text)">Registration paused for maintenance</h2>
      <p className="mt-3 text-small leading-relaxed text-(--color-text-muted)">
        We&apos;re upgrading our backend to serve you better. Participant registration will reopen shortly — please
        check back soon.
      </p>
      <p className="mt-6">
        <Button href="/july-award-2026" variant="secondary" size="md">
          ← Back to July Award 2026
        </Button>
      </p>
    </div>
  );
}

export default async function JulyParticipantRegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const alreadyRegistered = params.alreadyRegistered === "1";
  const sheetsReady = isJulyParticipantSheetsConfigured();

  return (
    <>
      <PageHeader
        title="Register as a participant"
        description="Reserve your seat at the July Uprising Memorial Award programme."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "July Award 2026", href: "/july-award-2026" },
          { label: "Participant registration" },
        ]}
        tone="pattern"
      />

      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer>
          {!sheetsReady && (
            <div
              className="mb-8 rounded-(--radius-md) border border-[color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-4 py-3 text-small text-(--color-error)"
              role="status"
            >
              Set <code className="rounded bg-(--color-surface-2) px-1">JULY_PARTICIPANT_GOOGLE_SHEET_ID</code>{" "}
              (separate spreadsheet). Optional:{" "}
              <code className="rounded bg-(--color-surface-2) px-1">JULY_PARTICIPANT_SHEET_TAB</code> (default{" "}
              <code className="rounded bg-(--color-surface-2) px-1">{JULY_PARTICIPANT_DEFAULT_TAB}</code>
              ). Same Google service account as other July forms; share the sheet as Editor.
            </div>
          )}

          {MAINTENANCE_MODE ? (
            <MaintenanceNotice />
          ) : alreadyRegistered ? (
            <div
              className="rounded-(--radius-md) border border-[color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-4 py-6 text-(--color-text)"
              role="alert"
            >
              <p className="text-base font-semibold text-(--color-error)">This email is already registered.</p>
              <p className="mt-2 text-small leading-relaxed text-(--color-text-muted)">
                An account with this email address has already been registered for the July Award 2026. If you believe
                this is an error, please contact us.
              </p>
              <p className="mt-4">
                <Button href="/july-award-2026" variant="ghost" size="md">
                  ← Back to July Award 2026
                </Button>
              </p>
            </div>
          ) : (
            <JulyParticipantRegistrationForm />
          )}

          {!alreadyRegistered && (
            <p className="mt-10 text-center">
              <Button href="/july-award-2026" variant="ghost" size="md">
                ← July Award 2026
              </Button>
            </p>
          )}
        </MarketingContainer>
      </Section>
    </>
  );
}
