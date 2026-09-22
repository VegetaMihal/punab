import { FormPageShell } from "@/components/ui/FormPageShell";
import Image from "next/image";
import { BabbfRegistrationForm } from "@/components/marketing/BabbfRegistrationForm";
import { EmojiCursorTrail } from "@/components/marketing/EmojiCursorTrail";
import { isBabbfGoogleConfigured } from "@/lib/babbf-registration-google";
import { BABBF_EVENT_TYPE_LABEL, type BabbfEventType } from "@/lib/validations/babbf-registration";

export const metadata = {
  title: "Register · BABBF Inter-University Armwrestler & Fitness Championship 2026",
  description: "Register for the BABBF Inter-University Armwrestler & Fitness Championship 2026.",
};

// Registration does a photo upload + a payment screenshot upload + a Sheets API call — keep the
// same generous timeout the other Sheets-backed registration routes use.
export const maxDuration = 60;

type Props = { searchParams: Promise<{ event?: string }> };

export default async function BabbfRegisterPage({ searchParams }: Props) {
  const sheetsReady = isBabbfGoogleConfigured();
  const { event } = await searchParams;
  const eventType: BabbfEventType = event === "bodybuilding" ? "bodybuilding" : "armwrestling";

  return (
    <>
      <EmojiCursorTrail emoji="💪" />

      <FormPageShell
        title={`BABBF Inter-University Armwrestler & Fitness Championship 2026 — ${BABBF_EVENT_TYPE_LABEL[eventType]}`}
        lead="Register to compete in the championship."
        backHref="/"
        backLabel="Back"
      >
          <div className="wall-sheet ja-sheet relative mb-10 p-2 pt-5">
            <Image
              src="/images/events/babbf-championship-2026.jpg"
              alt="BABBF Inter-University Armwrestler & Fitness Championship 2026"
              width={1536}
              height={1024}
              sizes="(min-width: 768px) 768px, 100vw"
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="wall-sheet wall-text ja-sheet mb-10 p-6 pt-9 sm:p-8 sm:pt-10">
            <h2 className="text-h4 font-semibold text-[color:var(--color-text)]">Event details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-small font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  Championship
                </dt>
                <dd className="mt-1 text-small text-[color:var(--color-text)]">
                  27 September 2026
                  <br />
                  KIB Convention Hall, Farmgate, Dhaka-1215
                </dd>
              </div>
              {eventType === "armwrestling" && (
                <>
                  <div>
                    <dt className="text-small font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                      Registration Deadline
                    </dt>
                    <dd className="mt-1 text-small text-[color:var(--color-text)]">26 September 2026</dd>
                  </div>
                  <div>
                    <dt className="text-small font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                      Weight-in
                    </dt>
                    <dd className="mt-1 text-small text-[color:var(--color-text)]">
                      26 September 2026
                      <br />
                      The Workout Club, Bashundhara
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* assumed: no registration-open/closed toggle requested for this event — always show the form */}
          {!sheetsReady && (
            <div
              className="mb-8 rounded-(--radius-md) border border-[color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-4 py-3 text-small text-(--color-error)"
              role="status"
            >
              Set <code className="rounded bg-(--color-surface-2) px-1">BABBF_REGISTRATION_SHEET_ID</code>,{" "}
              <code className="rounded bg-(--color-surface-2) px-1">BABBF_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL</code>,
              and{" "}
              <code className="rounded bg-(--color-surface-2) px-1">BABBF_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code>.
              Uses its own dedicated Google service account (separate from the other registration forms); share the
              sheet as Editor with that account&apos;s email.
            </div>
          )}

          <BabbfRegistrationForm eventType={eventType} />
        </FormPageShell>
    </>
  );
}
