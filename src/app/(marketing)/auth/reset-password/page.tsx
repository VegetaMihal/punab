import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

export const metadata = {
  title: "Reset your password",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="auth" className="relative">
        <Card variant="elevated" className="border-[color:var(--color-border)] p-6 sm:p-8">
          <div className="mb-6 flex justify-center">
            <Link href="/">
              <Logo variant="navbar" className="justify-center" />
            </Link>
          </div>
          <h1 className="mb-2 text-center text-h3 font-semibold text-[color:var(--color-text)]">
            Reset your password
          </h1>
          <p className="mb-6 text-center text-small text-[color:var(--color-text-muted)]">
            Choose a new password for your account.
          </p>
          <ResetPasswordForm />
        </Card>
      </MarketingContainer>
    </div>
  );
}
