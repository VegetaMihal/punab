import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

export const metadata = {
  title: "Application submitted",
};

export default function RegisterSubmittedPage() {
  return (
    <div className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="auth" className="relative">
        <Card variant="elevated" className="border-[color:var(--color-border)] p-6 text-center sm:p-8">
          <div className="mb-6 flex justify-center">
            <Link href="/">
              <Logo variant="navbar" className="justify-center" />
            </Link>
          </div>
          <h1 className="text-h3 font-semibold text-[color:var(--color-text)]">Application received</h1>
          <p className="mt-3 text-body text-[color:var(--color-text-muted)]">
            The PUNAB secretariat reviews every application. If approved, we&apos;ll email your login and a
            temporary password to the address you provided — no account exists until then.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block font-semibold text-[color:var(--color-brand)] hover:underline"
          >
            Back to home
          </Link>
        </Card>
      </MarketingContainer>
    </div>
  );
}
