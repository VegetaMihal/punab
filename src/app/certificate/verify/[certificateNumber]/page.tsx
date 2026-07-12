import { notFound } from "next/navigation";
import { getCertificateByNumber } from "@/lib/repositories";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

export const metadata = {
  title: "Certificate verification result",
};

export default async function VerifyCertificateResultPage({
  params,
}: {
  params: Promise<{ certificateNumber: string }>;
}) {
  const { certificateNumber } = await params;
  const certificate = await getCertificateByNumber(certificateNumber);
  if (!certificate) {
    return (
      <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
        <MarketingContainer maxWidth="3xl" className="relative">
          <SoftBackground />
          <Card variant="elevated" className="space-y-3 p-6 sm:p-8">
            <p className="w-fit rounded-[var(--radius-full)] border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-danger)]">
              Invalid
            </p>
            <h1 className="text-3xl font-bold text-[color:var(--color-text)]">Certificate Not Found</h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              We could not find a certificate matching <span className="font-mono">{certificateNumber}</span>.
            </p>
          </Card>
        </MarketingContainer>
      </main>
    );
  }

  if (!certificate.certificateNumber) {
    notFound();
  }

  if (certificate.status === "DRAFT" || certificate.status === "ARCHIVED") {
    return (
      <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
        <MarketingContainer maxWidth="3xl" className="relative">
          <SoftBackground />
          <Card variant="elevated" className="space-y-5 p-6 sm:p-8">
            <p className="w-fit rounded-[var(--radius-full)] border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Pending
            </p>
            <h1 className="text-3xl font-bold text-[color:var(--color-text)]">Certificate Not Publicly Valid Yet</h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              This certificate is currently in <span className="font-semibold">{certificate.status}</span> state.
            </p>
            <div className="grid gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 text-sm">
              <Info label="Recipient name" value={certificate.recipientName} />
              <Info label="Certificate title" value={certificate.certificateTitle} />
              <Info label="Certificate number" value={certificate.certificateNumber} mono />
            </div>
          </Card>
        </MarketingContainer>
      </main>
    );
  }

  if (certificate.status === "REVOKED") {
    return (
      <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
        <MarketingContainer maxWidth="3xl" className="relative">
          <SoftBackground />
          <Card variant="elevated" className="space-y-4 p-6 sm:p-8">
            <p className="w-fit rounded-[var(--radius-full)] border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-danger)]">
              Revoked
            </p>
            <h1 className="text-3xl font-bold text-[color:var(--color-text)]">Certificate Revoked</h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">This certificate is no longer valid.</p>
            <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 text-sm">
              <Info label="Recipient" value={certificate.recipientName} />
            </div>
          </Card>
        </MarketingContainer>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="3xl" className="relative">
        <SoftBackground />
        <Card variant="elevated" className="overflow-hidden p-0">
          <div className="border-b border-[color:var(--color-border)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-brand)_10%,var(--color-surface))_0%,var(--color-surface)_100%)] px-6 py-5 sm:px-8">
            <p className="mb-2 w-fit rounded-[var(--radius-full)] border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Verified
            </p>
            <h1 className="text-3xl font-bold text-[color:var(--color-text)]">Certificate Verified</h1>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">Status: Valid and authentic</p>
          </div>
          <div className="space-y-3 px-6 py-6 text-[15px] sm:px-8">
            <Info label="Recipient name" value={certificate.recipientName} />
            <Info label="Certificate title" value={certificate.certificateTitle} />
            <Info label="Reason" value={certificate.reason} />
            <Info label="Issue date" value={new Date(certificate.issueDate).toLocaleDateString("en-GB")} />
            <Info label="Certificate number" value={certificate.certificateNumber} mono />
          </div>
          <div className="border-t border-[color:var(--color-border)] px-6 py-4 text-sm text-[color:var(--color-text-muted)] sm:px-8">
            Authorized by PUNAB
          </div>
        </Card>
      </MarketingContainer>
    </main>
  );
}

function SoftBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 rounded-[var(--radius-xl)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-brand)_8%,var(--color-surface-2))_0%,var(--color-surface-2)_55%,var(--color-surface)_100%)] opacity-90"
      aria-hidden
    />
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
      <span className="font-semibold">{label}:</span>{" "}
      <span className={`${mono ? "font-mono text-xs sm:text-sm" : ""} wrap-break-word`}>{value}</span>
    </p>
  );
}
