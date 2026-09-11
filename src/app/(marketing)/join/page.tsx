import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartBackLink } from "@/components/ui/SmartBackLink";
import { getSessionProfile } from "@/lib/auth/session";
import { getPublicSettings } from "@/lib/data/site-content";
import { getSetting } from "@/lib/site-defaults";

export const metadata = {
  title: "Become a Member",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;
  const [{ user, profile }, settings] = await Promise.all([
    getSessionProfile().catch(() => ({ user: null, profile: null })),
    getPublicSettings().catch(() => ({}) as Record<string, string>),
  ]);

  return (
    <>
      <PageHeader title="Become a Member" description={getSetting(settings, "join.intro")} />
      <MarketingContainer maxWidth="3xl" className="py-12">
        <p className="mb-8 leading-relaxed text-muted">{getSetting(settings, "join.body")}</p>

        {params.registered === "1" && (
          <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            Account created. Our team will review your application, then you can use the member dashboard when you sign in.
          </div>
        )}

        <Card>
          <div className="flex flex-col items-center gap-6 py-4 text-center">
            <p className="text-body text-[color:var(--color-text)]">
              Fill out the PUNAB member application on our site. Our team will review it.
            </p>
            <Button href="/register" variant="primary" size="lg" className="min-w-[12rem]">
              Apply to join
            </Button>
          </div>
        </Card>

        {user && profile ? (
          <p className="mt-8 text-center text-sm text-muted">
            <SmartBackLink
              fallbackHref="/dashboard"
              className="font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Back to member dashboard
            </SmartBackLink>
          </p>
        ) : (
          <Card className="mt-8">
            <p className="text-sm text-muted">
              For the member dashboard (application status, profile),{" "}
              <Link
                href="/login"
                className="font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                sign in
              </Link>{" "}
              or{" "}
              <Link
                href="/register"
                className="font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                register
              </Link>
              .
            </p>
          </Card>
        )}
      </MarketingContainer>
    </>
  );
}
