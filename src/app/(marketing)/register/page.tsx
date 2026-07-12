import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";

export const metadata = {
  title: "Register",
};

export default async function RegisterPage() {
  const universities = await listUniversitiesForOptions().catch(() => []);

  return (
    <div className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="auth" className="relative">
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-[var(--radius-xl)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-brand)_8%,var(--color-surface-2))_0%,var(--color-surface-2)_55%,var(--color-surface)_100%)] opacity-90"
          aria-hidden
        />
        <Card variant="elevated" className="border-[color:var(--color-border)] p-6 sm:p-8">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-brand)]">
              <Logo variant="navbar" className="justify-center" />
            </Link>
          </div>
          <SignupForm universities={universities} />
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-[color:var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wide">
              <span className="bg-[color:var(--color-surface)] px-3 text-[color:var(--color-text-muted)]">Or</span>
            </div>
          </div>
          <p className="text-center text-small text-[color:var(--color-text-muted)]">University SSO and social login may be added later.</p>
          <p className="mt-6 text-center text-small text-[color:var(--color-text-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[color:var(--color-brand)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-brand)]"
            >
              Log in
            </Link>
          </p>
        </Card>
      </MarketingContainer>
    </div>
  );
}
