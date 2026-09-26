import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Card } from "@/components/ui/Card";
import { isBabbfVolunteerAuthenticated } from "@/actions/babbf-ticket-verify";
import { BabbfVolunteerPasscodeForm } from "@/components/marketing/BabbfVolunteerPasscodeForm";
import { BabbfScanPanel } from "@/components/marketing/BabbfScanPanel";

export const metadata = {
  title: "BABBF Championship 2026 — Check tickets",
};

export default async function BabbfScanPage() {
  const authenticated = await isBabbfVolunteerAuthenticated().catch(() => false);

  return (
    <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="3xl">
        <Card variant="elevated" className="space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Check tickets</h1>
          {!authenticated ? <BabbfVolunteerPasscodeForm /> : <BabbfScanPanel />}
        </Card>
      </MarketingContainer>
    </main>
  );
}
