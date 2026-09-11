import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { getSessionProfile } from "@/lib/auth/session";

export const metadata = {
  title: "Set your password",
};

export default async function ChangePasswordPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) {
    redirect("/login");
  }
  if (profile && !profile.first_login_required) {
    redirect("/dashboard");
  }

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
            Set your password
          </h1>
          <p className="mb-6 text-center text-small text-[color:var(--color-text-muted)]">
            You&apos;re signed in with a temporary password. Choose a new password to continue.
          </p>
          <ChangePasswordForm />
        </Card>
      </MarketingContainer>
    </div>
  );
}
