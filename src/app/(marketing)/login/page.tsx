import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

export const metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? "/dashboard";

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
          <LoginForm redirectTo={redirectTo} />
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-[color:var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wide">
              <span className="bg-[color:var(--color-surface)] px-3 text-[color:var(--color-text-muted)]">Or</span>
            </div>
          </div>
          <p className="text-center text-small text-[color:var(--color-text-muted)]">More sign-in options may be added later.</p>
          <p className="mt-6 text-center text-small text-[color:var(--color-text-muted)]">
            No account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[color:var(--color-brand)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-brand)]"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </MarketingContainer>
    </div>
  );
}
