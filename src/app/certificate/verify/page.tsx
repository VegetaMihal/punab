import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

export const metadata = {
  title: "Verify certificate",
};

export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ certificateNumber?: string }>;
}) {
  const { certificateNumber } = await searchParams;
  if (certificateNumber?.trim()) {
    redirect(`/certificate/verify/${encodeURIComponent(certificateNumber.trim())}`);
  }

  return (
    <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="3xl" className="relative">
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-[var(--radius-xl)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-brand)_8%,var(--color-surface-2))_0%,var(--color-surface-2)_55%,var(--color-surface)_100%)] opacity-90"
          aria-hidden
        />
        <Card variant="elevated" className="overflow-hidden p-0">
          <div className="border-b border-[color:var(--color-border)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-brand)_10%,var(--color-surface))_0%,var(--color-surface)_100%)] px-6 py-5 sm:px-8">
            <h1 className="text-3xl font-bold text-[color:var(--color-text)]">Verify Certificate</h1>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              Enter a certificate number to check authenticity.
            </p>
          </div>

          <form action="/certificate/verify" method="get" className="space-y-4 px-6 py-6 sm:px-8">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[color:var(--color-text)]">Certificate number</span>
              <input
                name="certificateNumber"
                required
                placeholder="PUNAB-CERT-2026-A1B2C3D4E5F6"
                className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 font-mono text-sm text-[color:var(--color-text)] outline-none ring-[color:var(--color-brand)]/40 focus:ring-2"
              />
            </label>
            <button className="rounded-[var(--radius-md)] bg-[color:var(--color-brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              Verify Certificate
            </button>
          </form>

          <div className="border-t border-[color:var(--color-border)] px-6 py-4 text-sm text-[color:var(--color-text-muted)] sm:px-8">
            Need help?{" "}
            <Link href="/" className="font-semibold text-[color:var(--color-brand)] hover:underline">
              Visit PUNAB
            </Link>
          </div>
        </Card>
      </MarketingContainer>
    </main>
  );
}
